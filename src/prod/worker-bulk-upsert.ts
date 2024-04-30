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

const getRate = ({ dateStart }: { dateStart: Date }): number => {
  const msPassed = new Date().getTime() - dateStart.getTime();
  const percentPassed = msPassed / refs.prod.duration;

  if (percentPassed < 0.2) return 500;
  else if (percentPassed < 0.4) return 750;
  else if (percentPassed < 0.6) return 1000;
  else if (percentPassed < 0.8) return 1250;
  else return 1500;
};

const sleep = async ({ value, dateStart }: { value: number; dateStart: Date }): Promise<void> => {
  const rate = getRate({ dateStart });
  const ms = (1000 * refs.general.workers * refs.general.batchSize) / rate;

  await H.sleep(2 * Math.random() * ms - value);
};

const main = async (): Promise<void> => {
  if (!H.checkWorkerData(workerData)) throw new Error('Wrong Worker Data');

  const generator = new Generator(refs.prod.date);
  const print = buildPrint(workerData);
  const dateStart = new Date();
  const batchSize = refs.general.batchSize;

  print('Starting');

  for (let i = 0; i < 100_000; i += 1) {
    const eventsScenarios = generator.getEventsScenarios(workerData.id);

    if (eventsScenarios == null) break;

    const timestamp = new Date();
    await P[workerData.appVersion].bulkUpsert(eventsScenarios.events);
    const value = new Date().getTime() - timestamp.getTime();

    await Promise.all([
      sleep({ value, dateStart }),
      P.measurements.insertOne({ app: workerData.appVersion, timestamp, type: 'bulkUpsert', value }),
    ]);

    if (i % 25 === 0) print(`Total: ${i * batchSize},Rate: ${(batchSize / (value / 1000)).toFixed(2)}/s`);
    if (H.shouldBreakProd(dateStart)) break;
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
