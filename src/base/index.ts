import * as P from '../persistence';
import type * as T from '../types';
import generator from '../generator';
import mdb from '../mdb';
import refs from '../references';

const worker = async (_: unknown, id: number): Promise<boolean> => {
  const bases = Array.from({ length: refs.workersTotal }).reduce<T.Base[]>(
    (acc) => {
      const base = generator.getBase(id);

      return base != null ? [...acc, base] : acc;
    },
    []
  );

  if (bases.length === 0) return false;

  await P.base.insertMany(bases);

  return true;
};

const main = async (): Promise<void> => {
  await mdb.checkCollections();

  console.log('Starting');

  for (let count = 0; count < 100_000; count += 1) {
    const results = await Promise.all(
      Array.from({ length: refs.workersTotal }).map(worker)
    );

    if (count % 10 === 0) {
      const time = new Date().toISOString().slice(11, 19);
      const total =
        Math.pow(refs.workersTotal, 2) * count * refs.base.batchSize;

      console.log(`[${time}] ${total.toExponential(2)} transactions created`);
    }

    if (results.includes(false)) break;
  }

  console.log('Finished');

  await mdb.close();
};

main().catch(console.error);
