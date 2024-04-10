#!/bin/bash

for APP_VERSION in appV0 appV1 appV2 appV3 appV4 appV5R0 appV5R1 appV5R2 appV5R3 appV6R0 appV6R1 appV6R2
do
  export APP_VERSION=$APP_VERSION

  echo "Running Load for $APP_VERSION"
  pm2 start ./src/load/ecosystem.config.js --no-daemon

  echo "Running Production for $APP_VERSION"
  pm2 start ./src/production/ecosystem.config.js --no-daemon
done