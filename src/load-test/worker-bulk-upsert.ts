import { parentPort, workerData } from 'worker_threads';

import * as H from '../helpers';
import * as P from '../applications';
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
  const percentPassed = msPassed / refs.loadTest.duration;

  if (percentPassed < 0.25) return 250;
  else if (percentPassed < 0.5) return 500;
  else if (percentPassed < 0.75) return 750;
  else return 1000;
};

const sleep = async ({ value, dateStart }: { value: number; dateStart: Date }): Promise<void> => {
  const rate = getRate({ dateStart });
  const ms = (1000 * refs.general.workers * refs.general.batchSize) / rate;

  await H.sleep(2 * Math.random() * ms - value);
};

const main = async (): Promise<void> => {
  if (!H.checkWorkerData(workerData)) throw new Error('Wrong Worker Data');

  const print = buildPrint(workerData);
  const generator = new Generator(refs.loadTest.date);
  const dateStart = new Date();
  const batchSize = refs.general.batchSize;
  const app = workerData.appVersion;

  print('Starting');

  for (let i = 0; i < 1_000_000; i += 1) {
    const events = generator.getBatchEvents();

    if (events == null) break;

    const timestamp = new Date();
    await P[app].bulkUpsert(events);
    const value = new Date().getTime() - timestamp.getTime();

    P.measurements.insertOne({ app, timestamp, type: 'bulkUpsert', value });

    await sleep({ value, dateStart });

    if (H.shouldBreakProd(dateStart)) break;
    if (i % 25 === 0) print(`Total: ${i * batchSize},Rate: ${(batchSize / (value / 1000)).toFixed(2)}/s`);
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
