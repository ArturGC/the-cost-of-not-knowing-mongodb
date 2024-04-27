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

const appVersions: T.AppVersion[] = ['appV1', 'appV2', 'appV3', 'appV4'];
appVersions.push('appV5R0', 'appV5R1', 'appV5R2', 'appV5R3', 'appV5R4');
appVersions.push('appV6R0', 'appV6R1', 'appV6R2', 'appV6R3', 'appV6R4');

const main = async (): Promise<void | never> => {
  await mdb.verifyCollections();

  for (const appVersion of appVersions) {
    await Promise.all(
      Array.from({ length: refs.general.workers }).map(async (_, id) => buildWorker({ appVersion, id }))
    );
  }

  await mdb.close();
};

main().catch(console.error);
