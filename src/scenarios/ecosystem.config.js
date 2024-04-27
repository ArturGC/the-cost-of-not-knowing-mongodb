const common = {
  autorestart: false,
  exec_mode: 'cluster',
  instances: 1,
  max_memory_restart: '2048M',
  watch: false,
  env: {
    EXEC_ENV: 'test',
  },
};

module.exports = {
  apps: [
    {
      ...common,
      name: 'scenarios-prod',
      script: './src/scenarios/prod.ts',
    },
    {
      ...common,
      name: 'scenarios-load',
      script: './src/scenarios/load.ts',
    },
  ],
};
