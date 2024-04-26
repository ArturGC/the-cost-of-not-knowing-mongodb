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
  eventsScenariosLoad: Collection<T.EventsScenarios>;
  eventsScenariosProd: Collection<T.EventsScenarios>;
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
      eventsScenariosLoad: this.dbBase.collection('eventsScenariosLoad'),
      eventsScenariosProd: this.dbBase.collection('eventsScenariosProd'),
      measurements: this.dbBase.collection('measurements'),
    };
  }

  verifyCollections = async (): Promise<void> => {
    const indexEventsScenarios = { worker: 1, date: 1, appSynced: 1 };
    await this.collections.eventsScenariosLoad.createIndex(indexEventsScenarios).catch(console.error);
    await this.collections.eventsScenariosProd.createIndex(indexEventsScenarios).catch(console.error);

    const timeseries = { granularity: 'seconds', metaField: 'metadata', timeField: 'timestamp' };
    await this.dbBase.createCollection('measurements', { timeseries }).catch(() => {});

    const storageEngine = { wiredTiger: { configString: 'block_compressor=zstd' } };
    await this.dbApp.createCollection('appV6R4', { storageEngine }).catch(() => {});

    const indexV1 = { '_id.key': 1, '_id.date': 1 };
    await this.collections.appV1.createIndex(indexV1, { unique: true }).catch(() => {});

    const indexV2 = { key: 1, date: 1 };
    await this.collections.appV2.createIndex(indexV2, { unique: true }).catch(() => {});
  };

  close = async (): Promise<void> => {
    await this.clientApp.close();
    await this.clientBase.close();
  };
}

export default new Mongo();
