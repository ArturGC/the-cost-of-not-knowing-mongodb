import { parentPort, workerData } from 'worker_threads';

import * as P from '../persistence';
import config from '../config';
import generator from '../generator';
import mdb from '../mdb';
import refs from '../references';

const getId = (): number => {
  const { id } = workerData as { id: number };

  return id % 10;
};

const buildPrint = (id: number): ((m: string) => void) => {
  const _id = `[${config.APP.VERSION}][GetReports][${id.toString().padStart(2, '0')}]`;

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    parentPort?.postMessage(`[${time}]${_id} ${m}`);
  };
};

const main = async (): Promise<void> => {
  const dateStart = new Date();
  const id = getId();
  const print = buildPrint(id);
  let dateRecent = refs.prod.dateStart;

  print('Starting');

  for (let count = 0; count < 1_000_000; count += 1) {
    const key = generator.getReportKey();

    const timestamp = new Date();
    await P[config.APP.VERSION].getReports({ date: dateRecent, key });
    const value = new Date().getTime() - timestamp.getTime();

    P.measurements.insertOne({ timestamp, type: 'getReports', value }).catch((e) => print(JSON.stringify(e)));

    if (count % 250 === 0 && count !== 0) {
      const rate = 1 / (value / 1000);
      print(`Total: ${count}, Rate: ${rate.toFixed(2)}/s`);

      await Promise.all([
        refs.prod.sleep.getReports(value, dateStart),
        P.measurements.insertOne({ timestamp, type: 'getReports', value }),
        P.base.getCurrentDate(id).then((currentDate) => (dateRecent = currentDate)),
      ]);
    } else {
      await Promise.all([
        refs.prod.sleep.getReports(value, dateStart),
        P.measurements.insertOne({ timestamp, type: 'getReports', value }),
      ]);
    }

    if (refs.prod.shouldBreak(dateStart)) break;
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
