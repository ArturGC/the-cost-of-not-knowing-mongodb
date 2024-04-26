import type * as T from '../types';
import mdb from '../mdb';

export const insertMany = async (eventsScenariosList: T.EventsScenarios[]): Promise<void> => {
  await mdb.collections.eventsScenariosLoad.insertMany(eventsScenariosList);
};

export const getNotUsed = async ({ appVersion, id }: T.WorkerData): Promise<T.EventsScenarios | null> => {
  return mdb.collections.eventsScenariosLoad.findOneAndUpdate(
    { app: { $ne: appVersion }, worker: id },
    { $set: { app: appVersion } },
    { sort: { date: 1 } }
  );
};
