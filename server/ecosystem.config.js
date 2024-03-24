module.exports = {
  apps: [
    {
      autorestart: true,
      exec_mode: 'cluster',
      instances: 4,
      max_memory_restart: '1024M',
      name: 'server',
      script: './index.ts',
      watch: true,

      env: {
        EXEC_ENV: 'test',
      },
    },
  ],
};
