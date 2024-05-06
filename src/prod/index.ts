import { Worker } from 'worker_threads';

import type * as T from '../types';
import mdb from '../mdb';
import refs from '../references';
import { sleep } from '../helpers';

const buildWorker = async (workerData: { appVersion: T.AppVersion; id: number }, file: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const path = `./build/prod/${file}.js`;
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
  // const appVersions: T.AppVersion[] = ['appV1', 'appV2', 'appV3', 'appV4'];
  const appVersions: T.AppVersion[] = ['appV5R0', 'appV5R1', 'appV5R2', 'appV5R3', 'appV5R4'];
  // const appVersions: T.AppVersion[] = ['appV6R0', 'appV6R1', 'appV6R2', 'appV6R3', 'appV6R4'];

  await mdb.verifyCollections();

  for (const appVersion of appVersions.reverse()) {
    const length = refs.general.workers;

    await Promise.all(Array.from({ length }).map(async (_, id) => buildWorker({ appVersion, id }, 'worker-warm')));

    await Promise.all([
      ...Array.from({ length }).map(async (_, id) => buildWorker({ appVersion, id }, 'worker-bulk-upsert')),
      ...Array.from({ length }).map(async (_, id) => buildWorker({ appVersion, id }, 'worker-get-reports')),
    ]);

    await sleep(5 * 6 * 1000);
  }

  await mdb.close();
};

main().catch(console.error);
