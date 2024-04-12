module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '3072M',
      name: 'app',
      script: './build/index.js',
      watch: false,

      env: {
        EXEC_ENV: 'test',
      },
    },
  ],
};
