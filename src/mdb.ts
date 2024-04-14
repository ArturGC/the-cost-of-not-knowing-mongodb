import { type Collection, type Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type * as T from './types';
import config from './config';

type Collections = {
  appV0: Collection<T.SchemaV0>;
  appV1: Collection<T.SchemaV0>;
  appV2: Collection<T.SchemaV1>;
  appV3: Collection<T.SchemaV2>;
  appV4: Collection<T.SchemaV3>;
  appV5R0: Collection<T.SchemaV4R0>;
  appV5R1: Collection<T.SchemaV4R0>;
  appV5R2: Collection<T.SchemaV4R0>;
  appV5R3: Collection<T.SchemaV4R1>;
  appV5R4: Collection<T.SchemaV4R1>;
  appV6R0: Collection<T.SchemaV5R0>;
  appV6R1: Collection<T.SchemaV5R0>;
  appV6R2: Collection<T.SchemaV5R1>;
  appV6R3: Collection<T.SchemaV5R0>;
  appV6R4: Collection<T.SchemaV5R0>;
  base: Collection<T.Base>;
  measurements: Collection<T.Measurement>;
};

class Mongo {
  clientApp: MongoClient;
  clientBase: MongoClient;
  collections: Collections;
  dbApp: Db;
  dbBase: Db;

  constructor() {
    this.clientApp = new MongoClient(config.MDB.URI_APP, config.MDB.OPTIONS);
    this.dbApp = this.clientApp.db(config.MDB.DB_NAME);

    this.clientBase = new MongoClient(config.MDB.URI_BASE, config.MDB.OPTIONS);
    this.dbBase = this.clientBase.db(config.MDB.DB_NAME);

    this.collections = {
      appV0: this.dbApp.collection('appV0'),
      appV1: this.dbApp.collection('appV1'),
      appV2: this.dbApp.collection('appV2'),
      appV3: this.dbApp.collection('appV3'),
      appV4: this.dbApp.collection('appV4'),
      appV5R0: this.dbApp.collection('appV5R0'),
      appV5R1: this.dbApp.collection('appV5R1'),
      appV5R2: this.dbApp.collection('appV5R2'),
      appV5R3: this.dbApp.collection('appV5R3'),
      appV5R4: this.dbApp.collection('appV5R4'),
      appV6R0: this.dbApp.collection('appV6R0'),
      appV6R1: this.dbApp.collection('appV6R1'),
      appV6R2: this.dbApp.collection('appV6R2'),
      appV6R3: this.dbApp.collection('appV6R3'),
      appV6R4: this.dbApp.collection('appV6R4'),
      base: this.dbBase.collection('base'),
      measurements: this.dbBase.collection('measurements'),
    };
  }

  close = async (): Promise<void> => {
    await this.clientApp.close();
    await this.clientBase.close();
  };

  dropDb = async (): Promise<void> => {
    await this.dbApp.dropDatabase();
    await this.dbBase.dropDatabase();
  };

  dropCollections = async (): Promise<void> => {
    await this.dbApp
      .collections()
      .then(async (collections) => Promise.all(collections.map(async (c) => c.drop().catch((e) => e))));

    await this.dbBase
      .collections()
      .then(async (collections) => Promise.all(collections.map(async (c) => c.drop().catch((e) => e))));
  };

  checkCollections = async (): Promise<void> => {
    await this.collections.appV1.createIndex({ '_id.key': 1, '_id.date': 1 }, { unique: true }).catch(() => {});

    await this.collections.appV2.createIndex({ key: 1, date: 1 }, { unique: true }).catch(() => {});

    await this.collections.base.createIndex({ worker: 1, date: 1, appSynced: 1 }).catch(() => {});

    await this.dbBase
      .createCollection('measurements', {
        timeseries: {
          granularity: 'seconds',
          metaField: 'metadata',
          timeField: 'timestamp',
        },
      })
      .catch(() => {});

    await this.dbApp
      .createCollection('appV6R4', {
        storageEngine: {
          wiredTiger: { configString: 'block_compressor=zstd' },
        },
      })
      .catch(() => {});
  };
}

export default new Mongo();
