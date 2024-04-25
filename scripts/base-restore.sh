#!/bin/bash

export NAME="base"
export URI="mongodb://arturgc:arturgc_123@agc.client.public.mdbtraining.net/?directConnection=true"

mongorestore  --gzip -j=15 --noIndexRestore --numInsertionWorkersPerCollection=4 \
  --archive="$NAME.gzip"  --uri="$URI"