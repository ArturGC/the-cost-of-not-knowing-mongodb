import { Worker } from 'worker_threads';

import type * as T from '../types';
import mdb from '../mdb';
import refs from '../references';
import { sleep } from '../helpers';

const buildWorker = async (workerData: { appVersion: T.AppVersion; id: number }, file: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const path = `./build/load-test/${file}.js`;
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
  const appVersions: T.AppVersion[] = [
    'appV1',
    // 'appV2',
    // 'appV3',
    // 'appV4',
    // 'appV5R0',
    // 'appV5R1',
    // 'appV5R2',
    // 'appV5R3',
    // 'appV5R4',
    // 'appV6R0',
    // 'appV6R1',
    // 'appV6R2',
    // 'appV6R3',
    // 'appV6R4',
  ];

  await mdb.verifyCollections();

  for (const appVersion of appVersions.reverse()) {
    const workersWarm = Array.from({
      length: refs.general.workers,
    }).map(async (_, id) => buildWorker({ appVersion, id }, 'worker-warm'));

    await Promise.all(workersWarm);

    const workersBulkUpsert = Array.from({
      length: refs.general.workers,
    }).map(async (_, id) => buildWorker({ appVersion, id }, 'worker-bulk-upsert'));

    const workerGetReports = Array.from({
      length: refs.general.workers,
    }).map(async (_, id) => buildWorker({ appVersion, id }, 'worker-get-reports'));

    await Promise.all([...workersBulkUpsert, ...workerGetReports]);

    await sleep(10 * 60 * 1000);
  }

  await mdb.close();
};

main().catch(console.error);
