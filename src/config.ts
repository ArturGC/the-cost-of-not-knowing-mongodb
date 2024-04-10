import { type AppVersion, type Measurement } from './types';

const TEST = {
  APP: {
    VERSION:
      (process.env.APP_VERSION as AppVersion) ?? ('appV0' satisfies AppVersion),
  },
  CLUSTER_ID: Number(process.env.CLUSTER_ID) ?? 0,
  MDB: {
    DB_NAME: 'test',
    OPTIONS: {
      appName: 'API Server TEST',
      ignoreUndefined: true,
      readPreference: 'primary',
      writeConcern: { journal: true, w: 'majority' },
    },
    URI_APP: 'mongodb://localhost:27017/',
    URI_BASE: 'mongodb://localhost:27017/',
  },
  TYPE:
    (process.env.TYPE as Measurement['metadata']['type']) ??
    ('getReports' satisfies Measurement['metadata']['type']),
} as const;

const PROD = {
  APP: {
    VERSION:
      (process.env.APP_VERSION as AppVersion) ?? ('appV0' satisfies AppVersion),
  },
  CLUSTER_ID: Number(process.env.CLUSTER_ID) ?? 0,
  MDB: {
    DB_NAME: 'prod',
    OPTIONS: {
      appName: 'API Server PROD',
      ignoreUndefined: true,
      readPreference: 'primary',
      writeConcern: { journal: true, w: 'majority' },
    },
    // URI_APP:
    //   'mongodb://arturgc:arturgc_123@agc.node.internal.mdbtraining.net/?directConnection=true',
    // URI_BASE:
    //   'mongodb://arturgc:arturgc_123@agc.client.internal.mdbtraining.net/?directConnection=true',
    URI_APP: 'mongodb://localhost:27017/',
    URI_BASE: 'mongodb://localhost:27017/',
  },
  TYPE:
    (process.env.TYPE as Measurement['metadata']['type']) ??
    ('getReports' satisfies Measurement['metadata']['type']),
} as const;

export default process.env.EXEC_ENV === 'prod' ? PROD : TEST;
