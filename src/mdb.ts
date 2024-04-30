import { type Collection, type Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type * as T from './types';
import config from './config';

type Collections = {
  appV1: Collection<T.SchemaV1>;
  appV2: Collection<T.SchemaV2>;
  appV3: Collection<T.SchemaV3>;
  appV4: Collection<T.SchemaV4>;
  appV5R0: Collection<T.SchemaV5R0>;
  appV5R1: Collection<T.SchemaV5R0>;
  appV5R2: Collection<T.SchemaV5R0>;
  appV5R3: Collection<T.SchemaV5R1>;
  appV5R4: Collection<T.SchemaV5R1>;
  appV6R0: Collection<T.SchemaV6R0>;
  appV6R1: Collection<T.SchemaV6R0>;
  appV6R2: Collection<T.SchemaV6R1>;
  appV6R3: Collection<T.SchemaV6R0>;
  appV6R4: Collection<T.SchemaV6R0>;
  measurements: Collection<T.Measurement>;
};

class Mongo {
  dbApp: Db;
  clientApp: MongoClient;

  dbBase: Db;
  clientBase: MongoClient;

  collections: Collections;

  constructor() {
    this.clientApp = new MongoClient(config.MDB.URI_APP, config.MDB.OPTIONS);
    this.dbApp = this.clientApp.db(config.MDB.DB_NAME);

    this.clientBase = new MongoClient(config.MDB.URI_BASE, config.MDB.OPTIONS);
    this.dbBase = this.clientBase.db(config.MDB.DB_NAME);

    this.collections = {
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
      measurements: this.dbBase.collection('measurements'),
    };
  }

  verifyCollections = async (): Promise<void> => {
    const timeseries = { granularity: 'seconds', metaField: 'metadata', timeField: 'timestamp' };
    await this.dbBase.createCollection('measurements', { timeseries }).catch(() => {});

    const storageEngine = { wiredTiger: { configString: 'block_compressor=zstd' } };
    await this.dbApp.createCollection('appV6R4', { storageEngine }).catch(() => {});

    const indexV1 = { '_id.key': 1, '_id.date': 1 };
    await this.collections.appV1.createIndex(indexV1, { unique: true }).catch(() => {});

    const indexV2 = { key: 1, date: 1 };
    await this.collections.appV2.createIndex(indexV2, { unique: true }).catch(() => {});

    const indexV3 = { key: 1, date: 1 };
    await this.collections.appV3.createIndex(indexV3, { unique: true }).catch(() => {});
  };

  close = async (): Promise<void> => {
    await this.clientApp.close();
    await this.clientBase.close();
  };
}

export default new Mongo();
