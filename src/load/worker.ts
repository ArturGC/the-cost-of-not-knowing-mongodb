import { parentPort, workerData } from 'worker_threads';

import * as P from '../persistence';
import type * as T from '../types';
import mdb from '../mdb';
import refs from '../references';

const ids = Array.from({ length: refs.general.workers }).map((_, i) => i);

const buildPrint = ({ appVersion, id }: T.WorkerData): ((m: string) => void) => {
  const header = `[${appVersion}][BulkUpsert][${id.toString().padStart(2, '0')}]`;

  return (m: string) => {
    const time = new Date().toISOString().slice(11, 19);
    parentPort?.postMessage(`[${time}]${header} ${m}`);
  };
};

const main = async (): Promise<void> => {
  const data = workerData as T.WorkerData;

  const print = buildPrint(data);

  print('Starting');

  for (let count = 0; count < 100_000; count += 1) {
    const eventsScenarios = await P.eventsScenariosLoad.getNotUsed(data);

    if (eventsScenarios == null) {
      const newId = ids.pop();

      if (newId == null) break;

      data.id = newId;

      continue;
    }

    await P[data.appVersion].bulkUpsert(eventsScenarios.events);

    if (count % 100 === 0) print(`Total: ${(count * refs.general.batchSize).toExponential(2)}`);
  }

  print('Finished');
};

main()
  .then(async () => mdb.close())
  .catch((e: Error) => parentPort?.postMessage(e.message));
