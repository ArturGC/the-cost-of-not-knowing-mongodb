'use strict';

const APP_VERSION = 'appV0';

module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'fork',
      instances: 1,
      name: 'production',
      script: 'k6 run ./index.js',
      watch: false,
      env: {
        APP_VERSION,
        K6_WEB_DASHBOARD: true,
        K6_WEB_DASHBOARD_HOST: '0.0.0.0',
        K6_WEB_DASHBOARD_PERIOD: '1s',
        K6_WEB_DASHBOARD_EXPORT: `../../results/${APP_VERSION}/load.html`
      },
    },
  ],
};
