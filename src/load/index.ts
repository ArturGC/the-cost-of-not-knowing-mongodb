import * as H from '../helpers';
import * as P from '../persistence';
import config from '../config';
import mdb from '../mdb';
import refs from '../references';

const buildPrint = (id: number): ((m: string) => void) => {
  const _id = `${id}`.padStart(2, '0');

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    console.log(`[${time}][${_id}]: ${m}`);
  };
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

  await refs.sleep(5 * 60 * 1000);

  await H.storeCollectionStats(config.APP.VERSION, 'load');

  await mdb.close();
};

main().catch((e) => console.dir(e, { depth: null }));
