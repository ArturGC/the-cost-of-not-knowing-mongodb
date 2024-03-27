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

const buildFieldSum = (
  date: { start: Date; end: Date },
  field: string
): Record<string, unknown> => {
  return {
    $cond: [
      { $and: [{ $gte: ['$date', date.start] }, { $lt: ['$date', date.end] }] },
      `$${field}`,
      0,
    ],
  };
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const reportDates = getReportsDates(date);

  const docsFromKeyBetweenDate = {
    date: { $gte: reportDates[4].start, $lt: reportDates[4].end },
    key: Buffer.from(key, 'hex'),
  };

  const groupCountItems = {
    _id: null,
    oneYearApproved: { $sum: buildFieldSum(reportDates[0], 'a') },
    oneYearNoFunds: { $sum: buildFieldSum(reportDates[0], 'n') },
    oneYearPending: { $sum: buildFieldSum(reportDates[0], 'p') },
    oneYearRejected: { $sum: buildFieldSum(reportDates[0], 'r') },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $group: groupCountItems },
    // { $project: { _id: 0 } },
  ];

  return mdb.collections.appV10
    .aggregate(pipeline)
    .toArray()
    .then((result) => {
      console.dir(result, { depth: null });

      return result;
    });
};
