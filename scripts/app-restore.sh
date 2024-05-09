#!/bin/bash

export NAME="app_v1_v2_v3_v4"
export URI="mongodb://arturgc:arturgc_123@3.90.245.246/?directConnection=true"
export APP_VERSION="appV1"

mongorestore  --gzip --numInsertionWorkersPerCollection=20 \
  --nsInclude=prod.$APP_VERSION --archive="$NAME.gzip"  --uri="$URI"