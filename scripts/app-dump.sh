#!/bin/bash

export NAME="app_v1"
export URI="mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true"

mongodump  --gzip -j=15 --archive="$NAME.gzip"  --uri="$URI"