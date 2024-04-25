import { type AppVersion } from './types';
import { type MongoClientOptions } from 'mongodb';

const TEST = {
  APP: {
    VERSION: (process.env.APP_VERSION as AppVersion) ?? ('appV4' satisfies AppVersion),
  },
  MDB: {
    DB_NAME: 'test',
    OPTIONS: {
      appName: 'Application Test',
      ignoreUndefined: true,
      readPreference: 'primary',
      writeConcern: { journal: true, w: 'majority' },
    } satisfies MongoClientOptions,
    URI_APP: 'mongodb://localhost:27017/',
    URI_BASE: 'mongodb://localhost:27017/',
  },
};

const PROD = {
  APP: {
    VERSION: (process.env.APP_VERSION as AppVersion) ?? ('appV0' satisfies AppVersion),
  },
  MDB: {
    DB_NAME: 'prod',
    OPTIONS: {
      appName: 'Application Prod',
      ignoreUndefined: true,
      readPreference: 'primary',
      writeConcern: { journal: true, w: 'majority' },
    } satisfies MongoClientOptions,
    URI_APP: 'mongodb://arturgc:arturgc_123@agc.node.internal.mdbtraining.net/?directConnection=true',
    URI_BASE: 'mongodb://arturgc:arturgc_123@agc.client.internal.mdbtraining.net/?directConnection=true',
  },
};

export default process.env.EXEC_ENV === 'prod' ? PROD : TEST;

let pipeline = [
  {
    $addFields: {
      _id: {
        key: '$key',
        date: '$date',
      },
    },
  },
  {
    $project: {
      key: 0,
      date: 0,
    },
  },
  {
    $out: 'appV0',
  },
];
