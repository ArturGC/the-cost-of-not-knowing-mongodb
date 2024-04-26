import type * as T from '../types';
import mdb from '../mdb';
import refs from '../references';

export const insertMany = async (eventsScenariosList: T.EventsScenarios[]): Promise<void> => {
  await mdb.collections.eventsScenariosProd.insertMany(eventsScenariosList);
};

export const getNotUsed = async ({ appVersion, id }: T.WorkerData): Promise<T.EventsScenarios | null> => {
  return mdb.collections.eventsScenariosProd.findOneAndUpdate(
    { app: { $ne: appVersion }, worker: id },
    { $set: { app: appVersion } },
    { sort: { date: 1 } }
  );
};

export const getCurrentDate = async ({ appVersion, id }: T.WorkerData): Promise<Date> => {
  return mdb.collections.eventsScenariosProd
    .findOne({ app: appVersion, worker: id }, { sort: { date: -1 } })
    .then((doc) => (doc != null ? doc.date : refs.prod.date.start));
};
