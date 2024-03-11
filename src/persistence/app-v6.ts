import {
  type AnyBulkWriteOperation,
  type BulkWriteResult,
  type Document,
} from 'mongodb';

import type * as T from '../types';
import mdb from '../mdb';

const buildId = (key: string, date: Date): Buffer => {
  const dateFormatted = date
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '')
    .slice(0, 6);

  return Buffer.from(`${key}${dateFormatted}`, 'hex');
};

const getDayFromDate = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '').slice(6);
};

export const bulkUpsert = async (docs: T.Body): Promise<BulkWriteResult> => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV6>>((doc) => {
    const dayNumber = getDayFromDate(doc.date);

    return {
      updateOne: {
        filter: {
          _id: buildId(doc.key, doc.date),
        },
        update: {
          $inc: {
            [`items.${dayNumber}.a`]: doc.approved,
            [`items.${dayNumber}.n`]: doc.noFunds,
            [`items.${dayNumber}.p`]: doc.pending,
            [`items.${dayNumber}.r`]: doc.rejected,

            'report.a': doc.approved,
            'report.n': doc.noFunds,
            'report.p': doc.pending,
            'report.r': doc.rejected,
          },
        },
        upsert: true,
      },
    };
  });

  return mdb.collections.appV6.bulkWrite(upsertOperations, { ordered: false });
};

export const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document[]> => {
  const lowerId = buildId(filter.key, filter.date.start);
  const upperId = buildId(filter.key, filter.date.end);

  return mdb.collections.appV6
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
