#!/bin/bash

export NAME="base_v3"
export URI="mongodb://arturgc:arturgc_123@agc.client.public.mdbtraining.net/?directConnection=true"

mongodump  --gzip -j=15 --archive="$NAME.gzip"  --uri="$URI"