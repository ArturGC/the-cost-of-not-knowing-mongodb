module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '1024M',
      name: 'base',
      script: './src/base/index.ts',
      watch: false,
    },
  ],
};
