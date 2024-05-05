#!/bin/bash

export NAME="app_v5_v6"
export URI="mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true"

mongorestore  --gzip --numInsertionWorkersPerCollection=40 \
  --nsInclude=prod.appV6R4 --archive="$NAME.gzip"  --uri="$URI"