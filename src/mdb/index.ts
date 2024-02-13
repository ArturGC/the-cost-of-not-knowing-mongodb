import { type Collection, type Db, type MongoClientOptions } from 'mongodb';
import { MongoClient } from 'mongodb';

import type * as T from '../types';

type Connect = (
  args?: { uri?: string; dbName?: string },
  options?: MongoClientOptions
) => Promise<void | never>;

type Collections = {
  appV0: Collection<T.DocV0>;
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
    this.client = new MongoClient('mongodb://localhost:27018', this.options);
    this.db = this.client.db('test');
    this.collections = this.getCollections();
  }

  connect: Connect = async (args, options = this.options) => {
    this.client = new MongoClient(
      args?.uri ?? 'mongodb://localhost:27018',
      options
    );
    this.db = this.client.db(args?.dbName ?? 'test');
    this.collections = this.getCollections();
  };

  close = async (): Promise<void> => this.client.close();

  private readonly getCollections = (): Collections => {
    return {
      appV0: this.db.collection('appV0'),
    };
  };
}

export default new Mongo();
