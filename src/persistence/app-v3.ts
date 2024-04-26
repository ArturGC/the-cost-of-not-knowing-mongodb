import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getReportsDates } from '../helpers';
import mdb from '../mdb';

export const buildKey = (key: string): Buffer => {
  return Buffer.from(key, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV3>>((doc) => {
    const query = {
      key: buildKey(doc.key),
      date: doc.date,
    };

    const mutation = {
      $inc: {
        a: doc.approved,
        n: doc.noFunds,
        p: doc.pending,
        r: doc.rejected,
      },
    };

    return {
      updateOne: {
        filter: query,
        update: mutation,
        upsert: true,
      },
    };
  });

  return mdb.collections.appV3.bulkWrite(upsertOperations, { ordered: false });
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    key: buildKey(key),
    date: { $gte: date.start, $lt: date.end },
  };

  const groupCountItems = {
    _id: null,
    approved: { $sum: '$a' },
    noFunds: { $sum: '$n' },
    pending: { $sum: '$p' },
    rejected: { $sum: '$r' },
  };

  const pipeline = [{ $match: docsFromKeyBetweenDate }, { $group: groupCountItems }, { $project: { _id: 0 } }];

  return mdb.collections.appV3
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
