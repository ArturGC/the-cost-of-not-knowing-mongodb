/* eslint-disable sort-keys */
import { type Collection, type Db, type MongoClientOptions } from 'mongodb';
import { MongoClient } from 'mongodb';

import type * as T from '../types';

type Connect = (
  args: { uri: string; dbName: string },
  options: MongoClientOptions
) => Promise<void | never>;

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
  appV10: Collection<T.DocV10>;
};

class Mongo {
  client: MongoClient;
  collections: Collections;
  db: Db;

  options: MongoClientOptions = {
    appName: 'API Server',
    ignoreUndefined: true,
    readPreference: 'primary',
    writeConcern: { journal: true, w: 'majority' },
  };

  constructor() {
    this.client = new MongoClient('mongodb://localhost:27017', this.options);
    this.db = this.client.db('test');
    this.collections = this.getCollections();
  }

  connect: Connect = async (args, options) => {
    this.client = new MongoClient(args.uri, options);
    this.db = this.client.db(args.dbName);
    this.collections = this.getCollections();
  };

  close = async (): Promise<void> => this.client.close();

  getCollections = (): Collections => {
    return {
      appV0: this.db.collection('appV0'),
      appV1: this.db.collection('appV1'),
      appV2: this.db.collection('appV2'),
      appV3: this.db.collection('appV3'),
      appV4: this.db.collection('appV4'),
      appV5: this.db.collection('appV5'),
      appV6: this.db.collection('appV6'),
      appV7: this.db.collection('appV7'),
      appV8: this.db.collection('appV8'),
      appV10: this.db.collection('appV10'),
    };
  };

  dropDb = async (): Promise<void> => {
    await this.db.dropDatabase();
  };

  dropCollections = async (): Promise<void> => {
    const collections = await this.db.collections();

    await Promise.all(collections.map(async (c) => c.drop().catch((e) => e)));
  };

  checkIndexes = async (): Promise<void> => {
    await this.collections.appV1.createIndex(
      { '_id.key': 1, '_id.date': 1 },
      { unique: true }
    );

    await this.collections.appV2.createIndex(
      { key: 1, date: 1 },
      { unique: true }
    );

    await this.db
      .createCollection('appV8', {
        storageEngine: {
          wiredTiger: { configString: 'block_compressor=zstd' },
        },
      })
      .catch(() => {});

    await this.db
      .createCollection('appV10', {
        timeseries: {
          timeField: 'date',
          metaField: 'key',
          bucketMaxSpanSeconds: 60 * 60 * 24 * 30 * 6,
          bucketRoundingSeconds: 60 * 60 * 24 * 30 * 6,
        },
      })
      .catch(() => {});
  };
}

export default new Mongo();
