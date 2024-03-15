#!/bin/bash

export PROFILE="agc-mdb"
export REGION="us-east-1"
export YOUR_NAME="Artur Costa"
export YOUR_NAME_DOT=$(echo $YOUR_NAME | tr '[:upper:] ' '[:lower:].')
export FILTER_OWNER_BASE='{"Name": "tag:owner", "Values": ["YOUR_NAME_DOT"]}'
export FILTER_OWNER="${FILTER_OWNER_BASE/YOUR_NAME_DOT/"$YOUR_NAME_DOT"}"
export FILTER_STATE='{"Name": "instance-state-name", "Values": ["running"]}'
export FILTERS="[$FILTER_OWNER, $FILTER_STATE]"

export INSTANCES=$( aws ec2 describe-instances --profile $PROFILE --region $REGION --filters "$FILTERS" )
export INSTANCES_IDS=$(echo $INSTANCES | jq -r '.Reservations[].Instances[]  | { "instanceid" : .InstanceId }| .instanceid ')

for INSTANCE_ID in $INSTANCES_IDS
do
 echo "Terminating $INSTANCE_ID"
 aws ec2 terminate-instances --profile $PROFILE --region $REGION --instance-ids $INSTANCE_ID
done