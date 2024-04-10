const APP_VERSION = process.env.APP_VERSION;

const apps = Array.from({ length: 5 }).map((_, clusterId) => {
  return {
    autorestart: false,
    exec_mode: 'cluster',
    instances: 1,
    max_memory_restart: '1024M',
    name: `load-${clusterId}-${APP_VERSION}`,
    script: './src/load/index.ts',
    watch: false,

    env: {
      APP_VERSION,
      CLUSTER_ID: clusterId,
      EXEC_ENV: 'prod',
      TYPE: 'bulkUpsert',
    },
  };
});

module.exports = {
  apps,
};
