/* eslint-disable sort-keys */
import { type BulkWriteResult, type Document } from 'mongodb';

import type * as T from '../types';
import { getReportsDates } from '../helpers';
import mdb from '../mdb';

export const bulkUpsert = async (
  docs: T.Body
): Promise<BulkWriteResult | unknown> => {
  const docsV9 = docs.map<Omit<T.DocV10, '_id'>>((doc) => {
    return {
      date: doc.date,
      key: Buffer.from(doc.key, 'hex'),
      a: doc.approved,
      n: doc.noFunds,
      p: doc.pending,
      r: doc.rejected,
    };
  }) as T.DocV10[];

  return mdb.collections.appV10.insertMany(docsV9, { ordered: false });
};

export const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document> => {
  const docsFromKeyBetweenDate = {
    date: { $gte: filter.date.start, $lt: filter.date.end },
    key: Buffer.from(filter.key, 'hex'),
  };

  const groupCountItems = {
    _id: null,
    approved: { $sum: '$a' },
    noFunds: { $sum: '$n' },
    pending: { $sum: '$p' },
    rejected: { $sum: '$r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $group: groupCountItems },
    { $project: { _id: 0 } },
  ];

  return mdb.collections.appV10
    .aggregate(pipeline)
    .toArray()
    .then(([result]) => result);
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const dates = getReportsDates(date);

  return Promise.all(
    dates.map(async (date) => {
      return { ...date, report: await getReport({ date, key }) };
    })
  );
};
