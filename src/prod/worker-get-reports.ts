import { parentPort, workerData } from 'worker_threads';

import * as H from '../helpers';
import * as P from '../persistence';
import type * as T from '../types';
import { Generator } from '../generator';
import mdb from '../mdb';
import refs from '../references';

const generator = new Generator(refs.prod.date);

const buildPrint = ({ appVersion, id }: T.WorkerData): ((m: string) => void) => {
  const header = `[${appVersion}][GetReports][${id.toString().padStart(2, '0')}]`;

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    parentPort?.postMessage(`[${time}]${header} ${m}`);
  };
};

const getRate = ({ dateStart }: { dateStart: Date }): number => {
  const msPassed = new Date().getTime() - dateStart.getTime();
  const percentPassed = msPassed / refs.prod.duration;
  const stage = (percentPassed % 0.2) / 0.2;

  if (stage < 0.25) return 50;
  else if (stage < 0.5) return 100;
  else if (stage < 0.75) return 150;
  else return 200;
};

const sleep = async ({ value, dateStart }: { value: number; dateStart: Date }): Promise<void> => {
  const rate = getRate({ dateStart });
  const ms = (1000 * refs.general.workers) / rate;

  await H.sleep(2 * Math.random() * ms - value);
};

const main = async (): Promise<void> => {
  const data = workerData as T.WorkerData;
  const dateStart = new Date();
  const print = buildPrint(data);
  let dateRecent = refs.prod.date.start;

  print('Starting');

  for (let count = 0; count < 1_000_000; count += 1) {
    const key = generator.getReportKey();

    const timestamp = new Date();
    await P[data.appVersion].getReports({ date: dateRecent, key });
    const value = new Date().getTime() - timestamp.getTime();

    const measurement = { app: data.appVersion, timestamp, type: 'getReports', value } as const;

    if (count % 250 === 0 && count !== 0) {
      const rate = 1 / (value / 1000);
      print(`Total: ${count}, Rate: ${rate.toFixed(2)}/s`);

      await Promise.all([
        sleep({ value, dateStart }),
        P.measurements.insertOne(measurement).catch(console.error),
        P.eventsScenariosProd.getCurrentDate(data).then((currentDate) => (dateRecent = currentDate)),
      ]);
    } else {
      await Promise.all([sleep({ value, dateStart }), P.measurements.insertOne(measurement).catch(console.error)]);
    }

    if (H.shouldBreakProd(dateStart)) break;
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
