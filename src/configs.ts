export const TEST = {
  MDB: {
    DB_NAME: 'test',
    OPTIONS: {
      appName: 'API Server TEST',
      ignoreUndefined: true,
      readPreference: 'primary',
    },
    URI: 'mongodb://localhost:27018',
  },
  SERVER: {
    PORT: 3000,
  },
} as const;

export const PROD = {
  MDB: {
    DB_NAME: 'prod',
    OPTIONS: {
      appName: 'API Server PROD',
      ignoreUndefined: true,
      readPreference: 'primary',
      writeConcern: { journal: true, w: 'majority' },
    },
    URI: 'mongodb://localhost:27018',
  },
  SERVER: {
    PORT: 3000,
  },
} as const;
