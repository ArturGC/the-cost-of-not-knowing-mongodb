module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '2048M',
      name: 'scenarios-load',
      script: './src/scenarios/load.ts',
      watch: false,

      env: {
        EXEC_ENV: 'test',
      },
    },
  ],
};
