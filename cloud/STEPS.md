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
1. [`Instance`] Reboot: `sudo reboot now`
1. [`Local`] Copy client code: `scp ...`
