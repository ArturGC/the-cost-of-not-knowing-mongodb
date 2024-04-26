import { parentPort, workerData } from 'worker_threads';

import * as H from '../helpers';
import * as P from '../persistence';
import type * as T from '../types';
import mdb from '../mdb';
import refs from '../references';

const buildPrint = ({ appVersion, id }: T.WorkerData): ((m: string) => void) => {
  const header = `[${appVersion}][BulkUpsert][${id.toString().padStart(2, '0')}]`;

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
  const data = workerData as T.WorkerData;
  const dateStart = new Date();
  const print = buildPrint(data);

  print('Starting');

  for (let count = 0; count < 100_000; count += 1) {
    const eventsScenarios = await P.eventsScenariosProd.getNotUsed(data);

    if (eventsScenarios == null) break;

    const timestamp = new Date();
    await P[data.appVersion].bulkUpsert(eventsScenarios.events);
    const value = new Date().getTime() - timestamp.getTime();
    const measurement = { app: data.appVersion, timestamp, type: 'bulkUpsert', value } as const;

    await Promise.all([sleep({ value, dateStart }), P.measurements.insertOne(measurement).catch(console.error)]);

    if (count % 25 === 0) print(`Total: ${(count * refs.general.batchSize).toExponential(2)}`);
    if (H.shouldBreakProd(dateStart)) break;
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
