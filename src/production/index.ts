import * as H from '../helpers';
import * as P from '../persistence';
import config from '../config';
import generator from '../generator';
import mdb from '../mdb';
import refs from '../references';

let date = refs.production.dateStart;

const buildPrint = (id: number): ((m: string) => void) => {
  const _id = `${id}`.padStart(2, '0');

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    console.log(`[${time}][${_id}]: ${m}`);
  };
};

const workerBulkUpsert = async (_: unknown, id: number): Promise<void> => {
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

    if (refs.production.shouldBreak()) break;
  }

  print('Finished');
};

const workerGetReports = async (_: unknown, id: number): Promise<void> => {
  const workerId = (refs.clustersBatch - 1) * config.CLUSTER_ID + id;
  const print = buildPrint(workerId);

  print('Starting');

  while (true) {
    const key = generator.getReportKey();

    const timestamp = new Date();
    await P[config.APP.VERSION].getReports({ date, key });
    const value = new Date().getTime() - timestamp.getTime();

    P.measurements
      .insertOne({ timestamp, type: 'getReports', value })
      .catch((e) => print(JSON.stringify(e)));

    await refs.production.sleep.getReports(value);

    if (refs.production.shouldBreak()) break;
  }

  print('Finished');
};

const main = async (): Promise<void> => {
  const worker =
    config.TYPE === 'bulkUpsert' ? workerBulkUpsert : workerGetReports;

  await mdb.checkCollections();

  await Promise.all(Array.from({ length: refs.workersPerCluster }).map(worker));

  await refs.sleep(5 * 60 * 1000);

  await H.storeCollectionStats(config.APP.VERSION, 'production');

  await mdb.close();
};

main().catch((e) => console.dir(e, { depth: null }));
