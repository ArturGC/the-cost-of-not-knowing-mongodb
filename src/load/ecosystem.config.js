module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '2048M',
      name: 'load',
      script: './build/load/index.js',
      watch: false,

      env: {
        EXEC_ENV: 'prod',
      },
    },
  ],
};
