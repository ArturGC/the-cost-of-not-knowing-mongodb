#!/bin/bash

export NAME="app_v5_v6"
export URI="mongodb://arturgc:arturgc_123@agc.node.internal.mdbtraining.net/?directConnection=true"
export APP_VERSION="appV6R4"

mongorestore  --gzip --numInsertionWorkersPerCollection=40 \
  --nsInclude=prod.$APP_VERSION --archive="$NAME.gzip"  --uri="$URI"