#!/bin/bash

export PROFILE="agc-mdb"
export YOUR_NAME="Artur Costa"
export REGION="us-east-1"
export KEY_NAME="arturgc_mdb_us_east_1"
export AMI="ami-07d9b9ddc6cd8dd30" # Ubuntu Server 22.04 LTS
export INSTANCE_TYPE="c7a.large"
export SECURITY_GROUP="sg-0e0aa6f8d2c9744e1" # Allow All Traffic
export SUBNET="subnet-08713b04009fe35ff"
export DISK_OS='{
  "DeviceName": "/dev/sda1", 
  "Ebs": {
    "DeleteOnTermination": true, 
    "VolumeSize": 15, 
    "VolumeType": "gp3"
  }
}'
export DISKS="[$DISK_OS]"
export TAG_OWNER="{Key=owner,Value='$(echo $YOUR_NAME | tr '[:upper:] ' '[:lower:].')'}"
export TAG_EXPIRE="{Key=expire-on,Value=\"$(date -d "+4 days" +%Y-%m-%d)\"}"
export TAG_TYPE="{Key=type,Value=\"client\"}"
export TAG_NAME="{Key=Name,  Value='$YOUR_NAME Article Test Client'}"
export TAGS="ResourceType=instance,Tags=[$TAG_NAME, $TAG_OWNER, $TAG_EXPIRE, $TAG_TYPE]"

aws ec2 run-instances \
  --profile $PROFILE \
  --region $REGION \
  --image-id $AMI \
  --count 1 \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SECURITY_GROUP \
  --subnet-id $SUBNET \
  --block-device-mappings "$DISKS" \
  --tag-specification "$TAGS"
