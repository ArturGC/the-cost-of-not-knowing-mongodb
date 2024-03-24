import {
  type AnyBulkWriteOperation,
  type BulkWriteResult,
  type Document,
} from 'mongodb';

import type * as T from '../types';
import { getReportDates } from '../helpers';
import mdb from '../mdb';

export const bulkUpsert = async (docs: T.Body): Promise<BulkWriteResult> => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV1>>((doc) => {
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

  return mdb.collections.appV1.bulkWrite(upsertOperations, { ordered: false });
};

const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document> => {
  const [result] = await mdb.collections.appV1
    .aggregate([
      {
        $match: {
          '_id.date': { $gte: filter.date.start, $lt: filter.date.end },
          '_id.key': filter.key,
        },
      },
      {
        $group: {
          _id: null,
          approved: { $sum: '$approved' },
          noFunds: { $sum: '$noFunds' },
          pending: { $sum: '$pending' },
          rejected: { $sum: '$rejected' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .toArray();

  return result;
};

export const getReports = async ({
  date,
  key,
}: {
  date: Date;
  key: string;
}): Promise<Document[]> => {
  const reportDates = getReportDates(date);

  return Promise.all(reportDates.map(async (date) => getReport({ date, key })));
};
