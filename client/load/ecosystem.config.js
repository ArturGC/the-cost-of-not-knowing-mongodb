'use strict';

module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'fork',
      instances: 1,
      name: 'load',
      script: './load.sh',
      watch: false,
    },
  ],
};
