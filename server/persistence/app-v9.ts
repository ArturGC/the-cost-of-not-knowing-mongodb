import { type BulkWriteResult, type Document } from 'mongodb';

import type * as T from '../types';
import { getReportsDates } from '../helpers';
import mdb from '../mdb';

export const bulkUpsert = async (
  docs: T.Body
): Promise<BulkWriteResult | unknown> => {
  const docsV9 = docs.map<Omit<T.DocV9, '_id'>>((doc) => {
    return {
      date: doc.date,
      key: Buffer.from(doc.key, 'hex'),
      values: [
        doc.approved ?? 0,
        doc.noFunds ?? 0,
        doc.pending ?? 0,
        doc.rejected ?? 0,
      ],
    };
  }) as T.DocV9[];

  return mdb.collections.appV9.insertMany(docsV9, { ordered: false });
};

export const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document> => {
  const [result] = await mdb.collections.appV9
    .aggregate([
      {
        $match: {
          date: { $gte: filter.date.start, $lt: filter.date.end },
          key: Buffer.from(filter.key, 'hex'),
        },
      },
      {
        $group: {
          _id: null,
          approved: { $sum: { $arrayElemAt: ['$values', 0] } },
          noFunds: { $sum: { $arrayElemAt: ['$values', 1] } },
          pending: { $sum: { $arrayElemAt: ['$values', 2] } },
          rejected: { $sum: { $arrayElemAt: ['$values', 3] } },
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

export const getReports: T.GetReports = async ({ date, key }) => {
  const dates = getReportsDates(date);

  return Promise.all(
    dates.map(async (date) => {
      return { ...date, report: await getReport({ date, key }) };
    })
  );
};
