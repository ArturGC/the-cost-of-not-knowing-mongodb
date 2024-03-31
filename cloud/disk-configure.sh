#!/bin/bash

export PARTITION_DISK="/dev/nvme1n1"
export PARTITION_PATH="/dev/nvme1n1p1"
export FOLDER_PATH="/data"
export DISK_SIZE_GB=100
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