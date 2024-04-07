import type * as T from '../types';
import config from '../config';
import mdb from '../mdb';

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
