import { type BulkWriteResult, type Document } from 'mongodb';

import type * as T from '../types';
import mdb from '../mdb';

export const bulkUpsert = async (
  docs: T.Body
): Promise<BulkWriteResult | unknown> => {
  const docsV8 = docs.map<Omit<T.DocV8, '_id'>>((doc) => {
    return {
      date: doc.date,
      key: doc.key,

      a: doc.approved,
      n: doc.noFunds,
      p: doc.pending,
      r: doc.rejected,
    };
  }) as T.DocV8[];

  return mdb.collections.appV8.insertMany(docsV8, { ordered: false });
};

export const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document[]> => {
  return mdb.collections.appV8
    .aggregate([
      {
        $match: {
          date: { $gte: filter.date.start, $lt: filter.date.end },
          key: filter.key,
        },
      },
      {
        $group: {
          _id: null,
          approved: { $sum: '$a' },
          noFunds: { $sum: '$n' },
          pending: { $sum: '$p' },
          rejected: { $sum: '$r' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .toArray();
};
