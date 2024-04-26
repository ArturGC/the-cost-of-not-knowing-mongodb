module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '2048M',
      name: 'scenarios-prod',
      script: './src/scenarios/prod.ts',
      watch: false,

      env: {
        EXEC_ENV: 'test',
      },
    },
  ],
};
