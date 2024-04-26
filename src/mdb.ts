import { type Collection, type Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type * as T from './types';
import config from './config';

type Collections = {
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
  };

  close = async (): Promise<void> => {
    await this.clientApp.close();
    await this.clientBase.close();
  };
}

export default new Mongo();
