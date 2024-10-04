import { parentPort, workerData } from 'worker_threads';

import * as H from '../helpers';
import * as P from '../applications';
import type * as T from '../types';
import { Generator } from '../generator';
import mdb from '../mdb';
import refs from '../references';

const buildPrint = ({ appVersion, id }: T.WorkerData): ((m: string) => void) => {
  const header = `[${appVersion.replace('app', '')}][GR][${id.toString().padStart(2, '0')}]`;

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    parentPort?.postMessage(`[${time}]${header} ${m}`);
  };
};

const getRate = ({ dateStart }: { dateStart: Date }): number => {
  const msPassed = new Date().getTime() - dateStart.getTime();
  const percentPassed = msPassed / refs.loadTest.duration;
  const stage = (percentPassed % 0.25) / 0.25;

  if (stage < 0.1) return 25;
  else if (stage < 0.2) return 50;
  else if (stage < 0.3) return 75;
  else if (stage < 0.4) return 100;
  else if (stage < 0.5) return 125;
  else if (stage < 0.6) return 150;
  else if (stage < 0.7) return 175;
  else if (stage < 0.8) return 200;
  else if (stage < 0.9) return 225;
  else return 250;
};

const sleep = async ({ value, dateStart }: { value: number; dateStart: Date }): Promise<void> => {
  const rate = getRate({ dateStart });
  const ms = (1000 * refs.general.workers) / rate;

  await H.sleep(2 * Math.random() * ms - value);
};

const main = async (): Promise<void> => {
  if (!H.checkWorkerData(workerData)) throw new Error('Wrong Worker Data');

  const print = buildPrint(workerData);
  const generator = new Generator(refs.loadTest.date);
  const dateStart = new Date();
  const app = workerData.appVersion;

  print('Starting');

  for (let i = 0; i < 1_000_000; i += 1) {
    const { date, key } = generator.getReportsValue();

    const timestamp = new Date();
    await P[app].getReports({ date, key });
    const value = new Date().getTime() - timestamp.getTime();

    P.measurements.insertOne({ app, timestamp, type: 'getReports', value });

    await sleep({ value, dateStart });

    if (H.shouldBreakProd(dateStart)) break;
    if (i % 25 === 0) print(`Total: ${i}, Rate: ${(1 / (value / 1000)).toFixed(2)}/s`);
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
