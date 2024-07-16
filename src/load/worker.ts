import { parentPort, workerData } from 'worker_threads';

import * as H from '../helpers';
import * as P from '../persistence';
import type * as T from '../types';
import { Generator } from '../generator';
import mdb from '../mdb';
import refs from '../references';

const buildPrint = ({ appVersion, id }: T.WorkerData): ((m: string) => void) => {
  const header = `[${appVersion.replace('app', '')}][BU][${id.toString().padStart(2, '0')}]`;

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    parentPort?.postMessage(`[${time}]${header} ${m}`);
  };
};

const main = async (): Promise<void> => {
  if (!H.checkWorkerData(workerData)) throw new Error('Wrong Worker Data');

  const generator = new Generator(refs.load.date);
  const print = buildPrint(workerData);
  const batchSize = refs.general.batchSize;

  print('Starting');

  for (let i = 0; i < 100_000; i += 1) {
    const events = generator.getEventsScenarios();

    if (events == null) break;

    const timestamp = new Date();
    await P[workerData.appVersion].bulkUpsert(events);
    const value = new Date().getTime() - timestamp.getTime();

    if (i % 100 === 0) print(`Total: ${i * batchSize},Rate: ${(batchSize / (value / 1000)).toFixed(2)}/s`);
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
