#!/bin/bash

export NAME="app_dump_v5_v6"
export URI="mongodb://arturgc:arturgc_123@agc.node.public.mdbtraining.net/?directConnection=true"
export APP_VERSION="appV6R4"

mongorestore  --gzip --numInsertionWorkersPerCollection=20 \
  --nsInclude=prod.$APP_VERSION --archive="$NAME.gzip"  --uri="$URI"