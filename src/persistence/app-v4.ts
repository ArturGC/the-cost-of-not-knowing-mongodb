import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { buildKey, getReportsDates, getYYYYMMDD } from '../helpers';
import mdb from '../mdb';

const buildId = (key: number, date: Date): Buffer => {
  return Buffer.from(`${buildKey(key)}${getYYYYMMDD(date)}`, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV3>>(
    (doc) => {
      const query = {
        _id: buildId(doc.key, doc.date),
      };

      const mutation = {
        $inc: {
          a: doc.a,
          n: doc.n,
          p: doc.p,
          r: doc.r,
        },
      };

      return {
        updateOne: {
          filter: query,
          update: mutation,
          upsert: true,
        },
      };
    }
  );

  return mdb.collections.appV4.bulkWrite(upsertOperations, { ordered: false });
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    _id: { $gte: buildId(key, date.start), $lt: buildId(key, date.end) },
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

  return mdb.collections.appV4
    .aggregate(pipeline)
    .toArray()
    .then(([result]) => result);
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const reportsDates = getReportsDates(date);
  const reports = reportsDates.map(async (date) => {
    return { ...date, report: await getReport({ date, key }) };
  });

  return Promise.all(reports);
};
