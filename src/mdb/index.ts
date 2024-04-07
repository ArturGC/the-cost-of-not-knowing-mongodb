import { type Collection, type Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type * as T from '../types';
import config from '../config';

type Collections = {
  appV0: Collection<T.DocV0>;
  appV1: Collection<T.DocV1>;
  appV2: Collection<T.DocV2>;
  appV3: Collection<T.DocV3>;
  appV4: Collection<T.DocV4>;
  appV5: Collection<T.DocV5>;
  appV6: Collection<T.DocV6>;
  appV7: Collection<T.DocV7>;
  appV8: Collection<T.DocV8>;
  appV9: Collection<T.DocV9>;
  appV10: Collection<T.DocV10>;
  appV11: Collection<T.DocV11>;
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
      appV5: this.dbApp.collection('appV5'),
      appV6: this.dbApp.collection('appV6'),
      appV7: this.dbApp.collection('appV7'),
      appV8: this.dbApp.collection('appV8'),
      appV9: this.dbApp.collection('appV9'),
      appV10: this.dbApp.collection('appV10'),
      appV11: this.dbApp.collection('appV11'),
      base: this.dbBase.collection('base'),
      measurements: this.dbBase.collection('measurements'),
    };
  }

  close = async (): Promise<void> => this.clientApp.close();

  dropDb = async (): Promise<void> => {
    await this.dbApp.dropDatabase();
  };

  dropCollections = async (): Promise<void> => {
    const collections = await this.dbApp.collections();

    await Promise.all(collections.map(async (c) => c.drop().catch((e) => e)));
  };

  checkCollections = async (): Promise<void> => {
    await this.collections.appV1.createIndex(
      { '_id.key': 1, '_id.date': 1 },
      { unique: true }
    );

    await this.collections.appV2.createIndex(
      { key: 1, date: 1 },
      { unique: true }
    );

    await this.collections.base.createIndex({
      worker: 1,
      date: 1,
      appSynced: 1,
    });

    await this.dbApp
      .createCollection('appV8', {
        storageEngine: {
          wiredTiger: { configString: 'block_compressor=zstd' },
        },
      })
      .catch(() => {});

    await this.dbApp
      .createCollection('appV11', {
        storageEngine: {
          wiredTiger: { configString: 'block_compressor=zstd' },
        },
      })
      .catch(() => {});

    await this.dbBase
      .createCollection('measurements', {
        timeseries: {
          granularity: 'seconds',
          timeField: 'timestamp',
          metaField: 'metadata',
        },
      })
      .catch(() => {});
  };
}

export default new Mongo();
