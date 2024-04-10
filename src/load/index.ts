import * as P from '../persistence';
import config from '../config';
import mdb from '../mdb';
import refs from '../references';

const buildPrint = (id: number) => {
  return (m: string) =>
    console.log(`[${new Date().toISOString().slice(11, 19)}][${id}]: ${m}`);
};

const worker = async (_: unknown, id: number): Promise<void> => {
  let count = 0;
  const workerId = (refs.clustersBatch - 1) * config.CLUSTER_ID + id;
  const print = buildPrint(workerId);

  print('Starting');

  while (true) {
    const base = await P.base.getNotUsed({
      dateEnd: refs.load.dateEnd,
      worker: workerId,
    });

    if (base == null) break;

    const timestamp = new Date();
    await P[config.APP.VERSION].bulkUpsert(base.transactions);
    const value = new Date().getTime() - timestamp.getTime();

    P.measurements
      .insertOne({ timestamp, type: 'bulkUpsert', value })
      .catch((e) => console.dir(e, { depth: null }));

    count += 1;

    if (count % 100 === 0) {
      print(`${count * refs.base.batchSize} transactions inserted`);
    }
  }

  print('Finished');
};

const main = async (): Promise<void> => {
  await mdb.checkCollections();
  await Promise.all(Array.from({ length: refs.workersPerCluster }).map(worker));
  await mdb.close();
};

main().catch((e) => console.dir(e, { depth: null }));
