'use strict';

module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'fork',
      instances: 1,
      name: 'production',
      script: './production.sh',
      watch: false,
    },
  ],
};
