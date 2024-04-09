const apps = Array.from({ length: 5 }).map((_, clusterId) => {
  return {
    autorestart: false,
    exec_mode: 'cluster',
    instances: 1,
    max_memory_restart: '1024M',
    name: `load-${clusterId}`,
    script: './src/load/index.ts',
    watch: false,

    env: {
      APP_VERSION: 'appV0',
      CLUSTER_ID: clusterId,
      EXEC_ENV: 'prod',
    },
  };
});

module.exports = {
  apps,
};
