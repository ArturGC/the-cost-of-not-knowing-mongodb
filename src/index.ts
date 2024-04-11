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

const v1: T.AppVersion[] = ['appV0', 'appV1', 'appV2', 'appV3', 'appV4'];
const v2: T.AppVersion[] = ['appV5R0', 'appV5R1', 'appV5R2', 'appV5R3'];
const v3: T.AppVersion[] = ['appV6R0', 'appV6R1', 'appV6R2'];

const main = async (): Promise<void | never> => {
  await mdb.checkCollections();

  const appVersions = [...v1, ...v2, ...v3];

  for (const appVersion of appVersions) {
    config.APP.VERSION = appVersion;

    await Promise.all([
      ...Array.from({ length: 20 }).map(async (_, id) =>
        buildWorker(id, 'load-bulk-write.js')
      ),
    ]);

    await refs.sleep(5000);
    await H.storeCollectionStats(config.APP.VERSION, 'load');

    await Promise.all([
      ...Array.from({ length: 20 }).map(async (_, id) =>
        buildWorker(id, 'prod-bulk-write.js')
      ),
      ...Array.from({ length: 20 }).map(async (_, id) =>
        buildWorker(id, 'prod-get-reports.js')
      ),
    ]);

    await refs.sleep(5000);
    await H.storeCollectionStats(config.APP.VERSION, 'production');
  }

  await mdb.close();
};

main().catch(console.error);
