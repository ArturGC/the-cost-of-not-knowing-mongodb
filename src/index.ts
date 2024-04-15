import { Worker } from 'worker_threads';

import * as H from './helpers';
import type * as T from './types';
import config from './config';
import mdb from './mdb';
import refs from './references';

const buildWorker = async (id: number, file: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const path = `./build/workers/${file}`;
    const workerData = { id };
    const worker = new Worker(path, { workerData });

    worker.on('error', (err) => {
      console.log(err.message);
      reject(err);
    });

    worker.on('message', (data: string) => {
      console.log(data);
      if (data.includes('Finished')) resolve(data);
    });
  });
};

const main = async (): Promise<void | never> => {
  await mdb.checkCollections();

  const appVersion: T.AppVersion = 'appV6R4';

  config.APP.VERSION = appVersion;
  process.env.APP_VERSION = appVersion;

  await Promise.all([
    ...Array.from({ length: refs.workersTotal }).map(async (_, id) => buildWorker(id, 'load-bulk-write.js')),
  ]);

  await refs.sleep(5 * 60 * 1000);
  await H.storeCollectionStats(config.APP.VERSION, 'load');

  await Promise.all([
    ...Array.from({ length: refs.workersTotal }).map(async (_, id) => buildWorker(id, 'prod-bulk-write.js')),
    ...Array.from({ length: refs.workersTotal }).map(async (_, id) => buildWorker(id, 'prod-get-reports.js')),
  ]);

  await refs.sleep(5 * 60 * 1000);
  await H.storeCollectionStats(config.APP.VERSION, 'production');

  await mdb.close();
};

main().catch(console.error);
