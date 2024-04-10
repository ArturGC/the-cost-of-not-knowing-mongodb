const appBase = {
  autorestart: false,
  exec_mode: 'cluster',
  instances: 1,
  kill_timeout: 30 * 60 * 1000,
  max_memory_restart: '1024M',
  script: './src/production/index.ts',
  watch: false,
};
const envBase = {
  APP_VERSION: 'appV0',
  EXEC_ENV: 'prod',
};

const appsBulkUpsert = Array.from({ length: 5 }).map((_, clusterId) => {
  return {
    ...appBase,
    name: `prod-bulkUpsert-${clusterId}`,
    env: {
      ...envBase,
      CLUSTER_ID: clusterId,
      TYPE: 'bulkUpsert',
    },
  };
});

const appsGetReports = Array.from({ length: 5 }).map((_, clusterId) => {
  return {
    ...appBase,
    name: `prod-getReports-${clusterId}`,
    env: {
      ...envBase,
      CLUSTER_ID: clusterId,
      TYPE: 'getReports',
    },
  };
});

module.exports = {
  apps: [...appsBulkUpsert, ...appsGetReports],
};
