# Steps to configure environment

## MongoDB Instance

1. [`Local`] Create MongoDB EC2: `./ec2-launch-mdb.sh`
1. [`Local`] Configure DNS: `./dns-configure-mdb.sh`
1. [`Local`] SSH to MongoDB EC2: `ssh -i ~/.ssh/arturgc_mdb_us_east_1.pem ubuntu@agc.node.public.mdbtraining.net`
1. [`Instance`] Configure MongoDB disk: `./disk-configure.sh`
1. [`Instance`] Configure Production Notes: `./production-nodes.sh`
1. [`Instance`] Configure Host Name: `sudo hostnamectl set-hostname agc.node.internal.mdbtraining.net`
1. [`Instance`] Reboot: `sudo reboot now`
1. [`Instance`] Install and Configure Cloud Manager Agent
1. [`CloudManager`] Start Monitor Agent
1. [`CloudManager`] Configure and Start Replica Set
1. [`Local`] Connect to MongoDB: `mongosh "mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true"`

## Client Instance

1. [`Local`] Create Client EC2: `./ec2-launch-client.sh`
1. [`Local`] Configure DNS: `./dns-config-client.sh`
1. [`Local`] SSH to Client EC2: `ssh -i ~/.ssh/arturgc_mdb_us_east_1.pem ubuntu@agc.client.public.mdbtraining.net`
1. [`Instance`] Configure Host Name: `sudo hostnamectl set-hostname agc.client.internal.mdbtraining.net`
1. [`Instance`] Install Node:
   ```bash
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm list-remote
   nvm install v20
   ```
1. [`Instance`] Install K6:
   ```bash
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```
1. [`Instance`] Install PM2: `npm install -g pm2 bun`
1. [`Instance`] Install PM2 TS: `pm2 install typescript`
1. [`Instance`] Reboot: `sudo reboot now`
1. [`Instance`] Configure Swap:

   ```bash
   cat /proc/swaps | grep -qv Filename

   if [[ $? -eq 0 ]]; then
      echo "Swap already configured"
   else
   echo "Configuring Swap"
   sudo dd if=/dev/zero of=/root/swap.bin count=4096 bs=1M
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
   ```

1. [`Instance|Local`] Configure VSCode Remote Access
1. [`Local`] Copy client code: `rm -rf node_modules && scp -r -i ~/.ssh/arturgc_mdb_us_east_1.pem  /home/arturgc/Documents/the-cost-of-not-knowing-mongodb/* ubuntu@agc.client.public.mdbtraining.net:/home/ubuntu/app/`
1. [`Local`] Dashboard: `http://agc.client.public.mdbtraining.net:5665/`

## Others

- Dump a collection: `mongodump --uri="mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true" --db=prod --collection=appV1 --gzip --archive=appV1.gz --numParallelCollections=8 --authenticationDatabase=admin`
- Restore a collection: `mongorestore --uri="mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true" --db=prod --collection=appV1 --gzip --archive=appV1.gz --numParallelCollections=8 --numInsertionWorkersPerCollection=40 --authenticationDatabase=admin`
