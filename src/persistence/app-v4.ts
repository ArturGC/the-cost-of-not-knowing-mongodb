import {
  type AnyBulkWriteOperation,
  type BulkWriteResult,
  type Document,
} from 'mongodb';

import type * as T from '../types';
import mdb from '../mdb';

const buildId = (key: string, date: Date): Buffer => {
  const dateFormatted = date.toISOString().split('T')[0].replace(/-/g, '');

  return Buffer.from(`${key}${dateFormatted}`, 'hex');
};

export const bulkUpsert = async (docs: T.Body): Promise<BulkWriteResult> => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV4>>((doc) => {
    return {
      updateOne: {
        filter: { _id: buildId(doc.key, doc.date) },
        update: {
          $inc: {
            a: doc.approved,
            n: doc.noFunds,
            p: doc.pending,
            r: doc.rejected,
          },
        },
        upsert: true,
      },
    };
  });

  return mdb.collections.appV4.bulkWrite(upsertOperations, { ordered: false });
};

export const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document[]> => {
  const lowerId = buildId(filter.key, filter.date.start);
  const upperId = buildId(filter.key, filter.date.end);

  return mdb.collections.appV4
    .aggregate([
      {
        $match: {
          _id: { $gte: lowerId, $lt: upperId },
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
