import type * as T from '../types';
import config from '../config';
import mdb from '../mdb';
import refs from '../references';

export const insertMany = async (bases: T.Base[]): Promise<void> => {
  await mdb.collections.base.insertMany(bases);
};

export const getNotUsed = async ({
  dateEnd,
  worker,
}: {
  dateEnd: Date;
  worker: number;
}): Promise<T.Base | null> => {
  return mdb.collections.base.findOneAndUpdate(
    {
      appSynced: { $ne: config.APP.VERSION },
      date: { $lt: dateEnd },
      worker,
    },
    {
      $set: { appSynced: config.APP.VERSION },
    },
    {
      sort: { date: 1 },
    }
  );
};

export const getCurrentDate = async (worker: number): Promise<Date> => {
  return mdb.collections.base
    .findOne({ appSynced: config.APP.VERSION, worker }, { sort: { date: -1 } })
    .then((doc) => (doc != null ? doc.date : refs.prod.dateStart));
};
