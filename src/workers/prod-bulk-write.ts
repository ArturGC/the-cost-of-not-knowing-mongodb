import { parentPort, workerData } from 'worker_threads';

import * as P from '../persistence';
import config from '../config';
import mdb from '../mdb';
import refs from '../references';

const buildPrint = (id: number): ((m: string) => void) => {
  const _id = `[${config.APP.VERSION}][BulkUpsert][${id.toString().padStart(2, '0')}]`;

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    parentPort?.postMessage(`[${time}]${_id}: ${m}`);
  };
};

const main = async (): Promise<void> => {
  const dateStart = new Date();
  const { id } = workerData as { id: number };
  const print = buildPrint(id);

  print('Starting');

  for (let count = 0; count < 100_000; count += 1) {
    const filter = { dateEnd: refs.prod.dateEnd, worker: id };
    const base = await P.base.getNotUsed(filter);

    if (base == null) break;

    const timestamp = new Date();
    await P[config.APP.VERSION].bulkUpsert(base.transactions);
    const value = new Date().getTime() - timestamp.getTime();

    P.measurements
      .insertOne({ timestamp, type: 'bulkUpsert', value })
      .catch(console.error);

    if (count % 100 === 0 && count !== 0) {
      const total = count * refs.base.batchSize;
      const rate = refs.base.batchSize / (value / 1000);

      print(`Total: ${total.toExponential(2)}, Rate: ${rate.toFixed(2)}/s`);
    }

    await refs.prod.sleep.bulkUpsert(value, dateStart);

    if (refs.prod.shouldBreak(dateStart)) break;
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
