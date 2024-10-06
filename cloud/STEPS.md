# Steps to configure environment

## MongoDB EC2 Instance

1. [`Local`] Create MongoDB EC2: `./ec2-mdb-launch.sh`
1. [`Local`] Configure DNS: `./ec2-mdb-dns.sh`
1. [`Local`] SSH to MongoDB EC2: `ssh -i ~/.ssh/arturgc_mdb_us_east_1.pem ubuntu@agc.mdb.public.mdb.net`
1. [`EC2 Instance`] Execute configuration script: `./ec2-mdb-config.sh`
1. [`EC2 Instance`] Install and Configure Cloud Manager Agent
1. [`CloudManager`] Start Monitor Agent
1. [`CloudManager`] Configure and Start Replica Set
1. [`Local`] Test connection to MongoDB: `mongosh "mongodb://arturgc:arturgc_123@agc.mdb.public.mdb.net/?directConnection=true"`

## Application EC2 Instance

1. [`Local`] Create Client EC2: `./ec2-app-launch.sh`
1. [`Local`] Configure DNS: `./ec2-app-dns.sh`
1. [`Local`] SSH to Client EC2: `ssh -i ~/.ssh/arturgc_mdb_us_east_1.pem ubuntu@agc.app.public.mdb.net`
1. [`EC2 Instance`] Clone Application code
1. [`EC2 Instance`] Execute configuration script: `./ec2-app-config.sh`
1. [`EC2 Instance`] Install and Configure Cloud Manager Agent
1. [`CloudManager`] Start Monitor Agent
1. [`CloudManager`] Configure and Start Replica Set

## TypeScript and Node

```bash
# MongoSH
wget https://downloads.mongodb.com/compass/mongodb-mongosh_2.2.5_amd64.deb
sudo apt install ./mongodb-mongosh_2.2.5_amd64.deb

# Node and TypeScript
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm list-remote
nvm install v20
```
