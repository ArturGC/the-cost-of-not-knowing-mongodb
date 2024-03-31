#!/bin/bash

for APP_VERSION in appV0 appV1 appV2 appV3 appV4 appV5 appV6 appV7 appV8 appV9 appV10 appV11
do
  export APP_VERSION=$APP_VERSION
  export K6_WEB_DASHBOARD=true
  export K6_WEB_DASHBOARD_HOST="0.0.0.0"
  export K6_WEB_DASHBOARD_PORT="5665"
  export K6_WEB_DASHBOARD_PERIOD="60s"
  export K6_WEB_DASHBOARD_EXPORT="../../results/$APP_VERSION/load.html"

  k6 run ./index.js

  sleep 300
done