#!/bin/bash

for APP_VERSION in appV0 appV1 appV2 appV3 appV4 appV5 appV6 appV7 appV8 appV9 appV10 appV11
do
  export APP_VERSION=$APP_VERSION

  echo "Running Load for $APP_VERSION"
  pm2 start ./src/load/ecosystem.config.js --no-deamon

  echo "Running Production for $APP_VERSION"
  pm2 start ./src/production/ecosystem.config.js --no-deamon
done