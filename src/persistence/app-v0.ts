import {
  type AnyBulkWriteOperation,
  type BulkWriteResult,
  type Document,
} from 'mongodb';

import type * as T from '../types';
import mdb from '../mdb';

export const bulkUpsert = async (
  docs: T.DocDefault[]
): Promise<BulkWriteResult> => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV0>>((doc) => {
    return {
      updateOne: {
        filter: { '_id.date': doc.date, '_id.key': doc.key },
        update: {
          $inc: {
            approved: doc.approved,
            noFunds: doc.noFunds,
            pending: doc.pending,
            rejected: doc.rejected,
          },
        },
        upsert: true,
      },
    };
  });

  return mdb.collections.appV0.bulkWrite(upsertOperations, { ordered: false });
};

export const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document[]> => {
  return mdb.collections.appV0
    .aggregate([
      {
        $match: {
          '_id.date': { $gte: filter.date.start, $lt: filter.date.end },
          '_id.key': filter.key,
        },
      },
      {
        $group: {
          _id: '$_id.key',
          approved: { $sum: '$approved' },
          noFunds: { $sum: '$noFunds' },
          pending: { $sum: '$pending' },
          rejected: { $sum: '$rejected' },
        },
      },
    ])
    .toArray();
};
