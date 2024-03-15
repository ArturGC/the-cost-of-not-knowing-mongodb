#!/bin/bash

export PROFILE="agc-mdb"
export YOUR_NAME="Artur Costa"
export YOUR_NAME_DOT=$(echo $YOUR_NAME | tr '[:upper:] ' '[:lower:].')
export REGION="us-east-1"
export HOSTED_ZONE_ID="Z3TN0LEC3UB30X"

export FILTER_STATE='{"Name": "instance-state-name", "Values": ["running"]}'
export FILTER_TYPE='{"Name": "tag:type", "Values": ["client"]}'
export FILTER_OWNER_BASE='{"Name": "tag:owner", "Values": ["YOUR_NAME_DOT"]}'
export FILTER_OWNER="${FILTER_OWNER_BASE/YOUR_NAME_DOT/"$YOUR_NAME_DOT"}"
export FILTERS="[$FILTER_OWNER, $FILTER_STATE, $FILTER_TYPE]"

export HOST_PRIVATE_FQDN="agc.client.internal.mdbtraining.net"
export HOST_PUBLIC_FQDN="agc.client.public.mdbtraining.net"

export HOSTS=$(aws ec2 describe-instances --profile agc-mdb --region $REGION --filters "$FILTERS")
export HOSTS_PRIVATE_IP=$(echo $HOSTS | jq -r ' .Reservations[0].Instances[0].PrivateIpAddress ')
export HOSTS_PUBLIC_IP=$(echo $HOSTS | jq -r ' .Reservations[0].Instances[0].PublicIpAddress ')

echo "Mapping $HOSTS_PRIVATE_IP to $HOST_PRIVATE_FQDN"

export CHANGE_BATCH='
{
  "Comment": "CREATE an A record",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "HOST_PRIVATE_FQDN",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{ "Value":"HOSTS_PRIVATE_IP"}]
  }
  }]
}'

export CHANGE_BATCH="${CHANGE_BATCH/HOST_PRIVATE_FQDN/"$HOST_PRIVATE_FQDN"}"
export CHANGE_BATCH="${CHANGE_BATCH/HOSTS_PRIVATE_IP/"$HOSTS_PRIVATE_IP"}"

aws route53 change-resource-record-sets \
  --profile $PROFILE --region $REGION \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch "$CHANGE_BATCH"

echo "Mapping $HOSTS_PUBLIC_IP to $HOST_PUBLIC_FQDN"

export CHANGE_BATCH='
{
  "Comment": "CREATE an A record",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "HOST_PUBLIC_FQDN",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{ "Value":"HOSTS_PUBLIC_IP"}]
  }
  }]
}'

export CHANGE_BATCH="${CHANGE_BATCH/HOST_PUBLIC_FQDN/"$HOST_PUBLIC_FQDN"}"
export CHANGE_BATCH="${CHANGE_BATCH/HOSTS_PUBLIC_IP/"$HOSTS_PUBLIC_IP"}"

aws route53 change-resource-record-sets \
  --profile $PROFILE --region $REGION \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch "$CHANGE_BATCH"