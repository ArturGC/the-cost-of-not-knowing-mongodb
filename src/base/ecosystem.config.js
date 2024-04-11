module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '2048M',
      name: 'base',
      script: './src/base/index.ts',
      watch: false,
    },
  ],
};
