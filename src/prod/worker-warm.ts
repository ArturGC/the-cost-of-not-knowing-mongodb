import { parentPort, workerData } from 'worker_threads';

import * as H from '../helpers';
import * as P from '../persistence';
import type * as T from '../types';
import { Generator } from '../generator';
import mdb from '../mdb';
import refs from '../references';

const buildPrint = ({ appVersion, id }: T.WorkerData): ((m: string) => void) => {
  const header = `[${appVersion.replace('app', '')}][WM][${id.toString().padStart(2, '0')}]`;

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    parentPort?.postMessage(`[${time}]${header} ${m}`);
  };
};

const sleep = async ({ value }: { value: number; dateStart: Date }): Promise<void> => {
  const rate = 100;
  const ms = (1000 * refs.general.workers) / rate;

  await H.sleep(2 * Math.random() * ms - value);
};

const shouldBreak = (dateStart: Date): boolean => {
  const msPassed = new Date().getTime() - dateStart.getTime();

  return msPassed > 5 * 60 * 1000;
};

const main = async (): Promise<void> => {
  if (!H.checkWorkerData(workerData)) throw new Error('Wrong Worker Data');

  const generator = new Generator(refs.prod.date);
  const print = buildPrint(workerData);
  const dateStart = new Date();

  print('Starting');

  for (let i = 0; i < 1_000_000; i += 1) {
    const { date, key } = generator.getReportValues();

    const timestamp = new Date();
    await P[workerData.appVersion].getReports({ date, key });
    const value = new Date().getTime() - timestamp.getTime();

    await sleep({ value, dateStart });

    if (shouldBreak(dateStart)) break;
    if (i % 25 === 0) print(`Total: ${i}, Rate: ${(1 / (value / 1000)).toFixed(2)}/s`);
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
