import { Worker } from 'worker_threads';

import type * as T from '../types';
import mdb from '../mdb';
import refs from '../references';

const buildWorker = async (workerData: { appVersion: T.AppVersion; id: number }): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const path = './build/load/worker.js';
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
  await mdb.verifyCollections();

  const appVersion: T.AppVersion = 'appV6R4';
  const list = Array.from({ length: refs.general.workers });
  const promises = list.map(async (_, id) => buildWorker({ appVersion, id }));

  await Promise.all(promises);

  await mdb.close();
};

main().catch(console.error);
