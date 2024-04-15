#!/bin/bash

sudo apt update -y
sudo apt upgrade -y


## DISK CONGIFURATION ##
# Disk Parameters
export PARTITION_DISK="/dev/nvme1n1"
export PARTITION_PATH="/dev/nvme1n1p1"
export FOLDER_PATH="/data"
export DISK_SIZE_GB=50
export DISK_FORMAT="xfs"

# Configure Partition
echo "$PARTITION_PATH : start= 2048, size= $(($DISK_SIZE_GB*1073741824/512-2048)), type=83" | sudo sfdisk $PARTITION_DISK

# Format disk
sudo mkfs -t $DISK_FORMAT $PARTITION_PATH

# Mount disk
sudo mkdir $FOLDER_PATH
sudo mount -t $DISK_FORMAT $PARTITION_PATH $FOLDER_PATH

# Configure auto mount on boot
grep -q $PARTITION_PATH /etc/fstab

if [[ $? -eq 0 ]]; then
	echo "Automount already configured"
else
	echo "Configuring automount"
  echo "$PARTITION_PATH    $FOLDER_PATH    $DISK_FORMAT    defaults,noatime 1 1" | sudo tee --append /etc/fstab
	echo "Automount configured"
fi

# Verify disk mounted
mount | grep $PARTITION_PATH | grep -q $DISK_FORMAT \
  && echo "Disk mounted with $DISK_FORMAT" \
  || echo "Disk NOT mounted with $DISK_FORMAT"

# Verify auto mount on boot
grep -q $PARTITION_PATH /etc/fstab \
  && echo "Device $PARTITION_PATH does mount on boot" \
  || echo "Device $PARTITION_PATH does NOT mount on boot"

# Verify auto mount configuration
sudo findmnt --verify

# NUMA Configure
grep -q 'vm.zone_reclaim_mode' /etc/sysctl.conf

if [[ $? -eq 0 ]]; then
	echo "Zone reclaim already configured"
else
  echo "Configuring zone reclaim"
  echo "vm.zone_reclaim_mode=0" | sudo tee --append /etc/sysctl.conf
  echo "Zone reclaim configured"
fi

sudo systemctl daemon-reload



## PRODUCTION NOTES ##
# NUMA Verify
sudo sysctl vm.zone_reclaim_mode | grep -q "= 0$" \
  && echo "Zone reclaim setting correct" \
  || echo "Zone reclaim setting incorrect"

# Max Map Count Configure
grep -q 'vm.max_map_count' /etc/sysctl.conf

if [[ $? -eq 0 ]]; then
	echo "Max Map Count already configured"
else
  echo "Configuring Max Map Count"
  echo "vm.max_map_count=128000" | sudo tee --append /etc/sysctl.conf
  echo "Max Map Count configured"
fi

sudo systemctl daemon-reload

# Max Map Count Verify
sudo sysctl vm.max_map_count | grep -q "= 128000$" \
  && echo "Max Map Count setting correct" \
  || echo "Max Map Count setting incorrect"

# Swap Configure
cat /proc/swaps | grep -qv Filename

if [[ $? -eq 0 ]]; then
	echo "Swap already configured"
else
  echo "Configuring Swap"
  sudo dd if=/dev/zero of=/root/swap.bin count=2048 bs=1M
  sudo chmod 600 /root/swap.bin
  sudo mkswap /root/swap.bin
  grep -q 'swap' /etc/fstab || echo "/root/swap.bin    none    swap    defaults 0 0" | sudo tee --append /etc/fstab
  sudo swapon /root/swap.bin
  
  echo "Configuring Swappiness"
  grep -q 'vm.swappiness' /etc/sysctl.conf || echo "vm.swappiness=1" | sudo tee --append /etc/sysctl.conf
  sudo sysctl -w  vm.swappiness=1
  sudo systemctl daemon-reload

  echo "Swap Configured"
fi

# Swap Verify
cat /proc/swaps | grep -qv Filename \
  && echo "Swap is configured" \
  || echo "Swap is not configured"

# Swappiness Verify
sudo sysctl vm.swappiness | grep -q "= 1$" \
  && echo "Swappiness setting correct" \
  || echo "Swappiness setting incorrect"

# Disk Access Time Verify
grep /data /etc/fstab | grep -q noatime \
  && echo "Access time on data drive is disabled" \
  || echo "Access time on data drive isn't disabled"

# User Resources Limits Configure
for limit in fsize cpu as memlock
do
  grep "mongod" /etc/security/limits.conf | grep -q $limit || echo -e "mongod  hard  $limit  unlimited\nmongod  soft  $limit  unlimited" | sudo tee --append /etc/security/limits.conf
done

for limit in nofile noproc
do
  grep "mongod" /etc/security/limits.conf | grep -q $limit || echo -e "mongod  hard  $limit  64000\nmongod  soft  $limit  64000" | sudo tee --append /etc/security/limits.conf
done

# Disable Transparent Huge Pages Configure
SCRIPT=$(cat << 'ENDSCRIPT'
[Unit]
Description=Disable Transparent Huge Pages (THP)
DefaultDependencies=no
After=sysinit.target local-fs.target
Before=mongod.service
[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo never | tee /sys/kernel/mm/transparent_hugepage/enabled > /dev/null'
[Install]
WantedBy=basic.target
ENDSCRIPT
)

echo "$SCRIPT" | sudo tee /etc/systemd/system/disable-transparent-huge-pages.service
sudo chmod 755 /etc/systemd/system/disable-transparent-huge-pages.service

sudo systemctl daemon-reload
sudo systemctl start disable-transparent-huge-pages
sudo systemctl enable disable-transparent-huge-pages

# Set Readahead Configure
SCRIPT=$(cat << 'ENDSCRIPT'
[Unit]
Description=Set Readahead
DefaultDependencies=no
After=sysinit.target local-fs.target
Before=mongod.service
[Service]
Type=oneshot
ExecStart=/bin/sh -c 'blockdev --setra 32 /dev/nvme1n1p1 > /dev/null'
[Install]
WantedBy=basic.target
ENDSCRIPT
)

echo "$SCRIPT" | sudo tee /etc/systemd/system/set-readahead.service
sudo chmod 755 /etc/systemd/system/set-readahead.service

sudo systemctl daemon-reload
sudo systemctl start set-readahead
sudo systemctl enable set-readahead

# Set Readahead Verify
sudo blockdev --getra /dev/nvme1n1 | grep -Eq '^8|32$' \
  && echo "Readahead on data disk is correct" \
  || echo "Readahead on data disk is wrong"



## EC2 CONGIFURATION ##
# Change machine hostname
sudo hostnamectl set-hostname agc.node.internal.mdbtraining.net

# Reboot
sudo reboot now