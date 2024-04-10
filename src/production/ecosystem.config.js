const APP_VERSION = process.env.APP_VERSION;

const appBase = {
  autorestart: false,
  exec_mode: 'cluster',
  instances: 1,
  max_memory_restart: '1024M',
  script: './src/production/index.ts',
  watch: false,
};

const envBase = {
  APP_VERSION,
  EXEC_ENV: 'prod',
};

const appsBulkUpsert = Array.from({ length: 1 }).map((_, clusterId) => {
  return {
    ...appBase,
    name: `${APP_VERSION}-prod-bulkUpsert-${clusterId}`,
    env: {
      ...envBase,
      CLUSTER_ID: clusterId,
      TYPE: 'bulkUpsert',
    },
  };
});

const appsGetReports = Array.from({ length: 1 }).map((_, clusterId) => {
  return {
    ...appBase,
    name: `${APP_VERSION}-prod-getReports-${clusterId}`,
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
