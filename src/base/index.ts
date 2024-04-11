import * as P from '../persistence';
import type * as T from '../types';
import generator from '../generator';
import mdb from '../mdb';
import refs from '../references';

const worker = async (_: unknown, id: number): Promise<void> => {
  const basesBatch = 10;

  for (let count = 0; count < 100_000; count += 1) {
    const bases = Array.from({ length: basesBatch }).reduce<T.Base[]>((acc) => {
      const base = generator.getBase(id);

      return base != null ? [...acc, base] : acc;
    }, []);

    if (bases.length === 0) break;

    await P.base.insertMany(bases);

    if (id === 0 && count % 10 === 0) {
      const total =
        basesBatch * refs.workersTotal * count * refs.base.batchSize;
      const time = new Date().toISOString().slice(11, 19);

      console.log(`[${time}] ${total.toExponential(2)} transactions created`);
    }
  }

  console.log('Finished');
};

const main = async (): Promise<void> => {
  await mdb.checkCollections();
  await Promise.all(Array.from({ length: refs.workersTotal }).map(worker));
  await mdb.close();
};

main().catch((e) => console.dir(e, { depth: null }));
