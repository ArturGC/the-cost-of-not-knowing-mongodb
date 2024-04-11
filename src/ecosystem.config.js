module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '2048M',
      name: 'app',
      script: 'npx tsc && node ./build/index.js',
      watch: false,
    },
  ],
};
