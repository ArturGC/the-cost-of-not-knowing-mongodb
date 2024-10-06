import { type MongoClientOptions } from 'mongodb';

const TEST = {
  MDB: {
    DB_NAME: 'test',
    OPTIONS: {
      appName: 'Application Test',
      ignoreUndefined: true,
      readPreference: 'primary',
    } satisfies MongoClientOptions,
    URI_APP: 'mongodb://localhost:27018/',
    URI_BASE: 'mongodb://localhost:27018/',
  },
};

const PROD = {
  MDB: {
    DB_NAME: 'prod',
    OPTIONS: {
      appName: 'Application Prod',
      ignoreUndefined: true,
      readPreference: 'primary',
      writeConcern: { journal: true, w: 'majority' },
    } satisfies MongoClientOptions,
    URI_APP: 'mongodb://localhost:27017/',
    URI_BASE: 'mongodb://localhost:27017/',
  },
};

export default process.env.EXEC_ENV === 'prod' ? PROD : TEST;
