import * as P from '../persistence';
import type * as T from '../types';
import { Generator } from '../generator';
import mdb from '../mdb';
import refs from '../references';

const generator = new Generator(refs.load.date);

const worker = async (_: unknown, id: number): Promise<boolean> => {
  const list = Array.from({ length: refs.general.workers });
  const eventsScenariosLoad = list.reduce<T.EventsScenarios[]>((acc) => {
    const eventsScenarios = generator.getEventsScenarios(id);

    return eventsScenarios != null ? [...acc, eventsScenarios] : acc;
  }, []);

  if (eventsScenariosLoad.length === 0) return false;

  await P.eventsScenariosLoad.insertMany(eventsScenariosLoad);

  return true;
};

const main = async (): Promise<void> => {
  await mdb.verifyCollections();

  console.log('Starting');

  for (let count = 0; count < 100_000; count += 1) {
    const workersPromises = Array.from({ length: refs.general.workers }).map(worker);
    const results = await Promise.all(workersPromises);

    if (results.includes(false)) break;

    if (count % 10 !== 0) continue;

    const time = new Date().toISOString().slice(11, 19);
    const total = Math.pow(refs.general.workers, 2) * count * refs.general.batchSize;

    console.log(`[${time}] ${total.toExponential(2)} transactions created`);
  }

  console.log('Finished');

  await mdb.close();
};

main().catch(console.error);
