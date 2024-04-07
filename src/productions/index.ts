/* eslint-disable no-unmodified-loop-condition */
import * as P from '../persistence';
import config from '../config';
import generator from '../generator';
import mdb from '../mdb';
import refs from '../references';

let date = refs.production.dateStart;
let keepLooping: boolean = true;

const buildPrint = (id: number) => {
  return (m: string) =>
    console.log(`[${new Date().toISOString().slice(11, 19)}][${id}]: ${m}`);
};

const workerBulkUpsert = async (id: number): Promise<void> => {
  const workerId = (refs.clustersBatch - 1) * config.CLUSTER_ID + id;
  const print = buildPrint(workerId);

  print('Starting');

  while (true) {
    const base = await P.base.getNotUsed({
      dateEnd: refs.production.dateEnd,
      worker: workerId,
    });

    if (base == null) break;

    const timestamp = new Date();
    await P[config.APP.VERSION].bulkUpsert(base.transactions);
    const value = new Date().getTime() - timestamp.getTime();

    P.measurements
      .insertOne({ timestamp, type: 'bulkUpsert', value })
      .catch((e) => print(JSON.stringify(e)));

    await refs.production.sleep.bulkUpsert(value);

    date = base.transactions[0].date;
  }

  keepLooping = false;

  print('Finished');
};

const workerGetReports = async (id: number): Promise<void> => {
  const workerId = (refs.clustersBatch - 1) * config.CLUSTER_ID + id;
  const print = buildPrint(workerId);

  print('Starting');

  while (keepLooping) {
    const key = generator.getReportKey();

    const timestamp = new Date();
    await P[config.APP.VERSION].getReports({ date, key });
    const value = new Date().getTime() - timestamp.getTime();

    P.measurements
      .insertOne({ timestamp, type: 'getReports', value })
      .catch((e) => print(JSON.stringify(e)));

    await refs.production.sleep.getReports(value);
  }

  print('Finished');
};

const main = async (): Promise<void> => {
  await mdb.checkCollections();

  await Promise.all(
    Array.from({ length: refs.workersPerCluster }).map(async (_, id) => {
      return config.TYPE === 'bulkUpsert'
        ? workerBulkUpsert(id)
        : workerGetReports(id);
    })
  );

  await mdb.close();
};

main().catch((e) => console.dir(e, { depth: null }));
