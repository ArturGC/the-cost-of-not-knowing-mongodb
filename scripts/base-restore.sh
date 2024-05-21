#!/bin/bash

export NAME="base_v2"
export URI="mongodb+srv://arturgc:arturgc_123@ragnarok.qicxjmm.mongodb.net/"

mongorestore  --gzip -j=15 --noIndexRestore --numInsertionWorkersPerCollection=4 \
  --nsFrom="prod.measurements" --nsTo="prod.measurements_v2" \
  --archive="$NAME.gzip"  --uri="$URI"