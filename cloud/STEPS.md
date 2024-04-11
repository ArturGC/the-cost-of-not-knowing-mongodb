# Steps to configure environment

## MongoDB Instance

1. [`Local`] Create MongoDB EC2: `./ec2-launch-mdb.sh`
1. [`Local`] Configure DNS: `./dns-configure-mdb.sh`
1. [`Local`] SSH to MongoDB EC2: `ssh -i ~/.ssh/arturgc_mdb_us_east_1.pem ubuntu@agc.node.public.mdbtraining.net`
1. [`Instance`] Execute configuration script: `./ec2-mdb-config.sh`
1. [`Instance`] Install and Configure Cloud Manager Agent
1. [`CloudManager`] Start Monitor Agent
1. [`CloudManager`] Configure and Start Replica Set
1. [`Local`] Connect to MongoDB: `mongosh "mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true"`

## Client Instance

1. [`Local`] Create Client EC2: `./ec2-launch-client.sh`
1. [`Local`] Configure DNS: `./dns-config-client.sh`
1. [`Local`] SSH to Client EC2: `ssh -i ~/.ssh/arturgc_mdb_us_east_1.pem ubuntu@agc.client.public.mdbtraining.net`
1. [`Instance`] Execute configuration script: `./ec2-client-config.sh`
1. [`Instance`] Install and Configure Cloud Manager Agent
1. [`CloudManager`] Start Monitor Agent
1. [`CloudManager`] Configure and Start Replica Set
1. [`Instance|Local`] Configure VSCode Remote Access
1. [`Local`] Copy client code: `rm -rf node_modules && scp -r -i ~/.ssh/arturgc_mdb_us_east_1.pem  /home/arturgc/Documents/the-cost-of-not-knowing-mongodb/* ubuntu@agc.client.public.mdbtraining.net:/home/ubuntu/app/`

## Others

- Dump a collection: `mongodump --uri="mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true" --db=prod --collection=appV1 --gzip --archive=appV1.gz --numParallelCollections=8 --authenticationDatabase=admin`
- Restore a collection: `mongorestore --uri="mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true" --db=prod --collection=appV1 --gzip --archive=appV1.gz --numParallelCollections=8 --numInsertionWorkersPerCollection=40 --authenticationDatabase=admin`

## TypeScript and Node

```bash
# Node and TypeScript
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm list-remote
nvm install v20
npm install -g pm2 bun typescript ts-node
pm2 install typescript
```
