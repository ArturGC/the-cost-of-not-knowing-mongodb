import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getReportsInfo, getYYYYMMDD } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: string, date: Date): Buffer => {
  return Buffer.from(`${key}${getYYYYMMDD(date)}`, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (events) => {
  const upsertOperations = events.map<AnyBulkWriteOperation<T.SchemaV4>>((event) => {
    const query = {
      _id: buildId(event.key, event.date),
    };

    const mutation = {
      $inc: {
        a: event.approved,
        n: event.noFunds,
        p: event.pending,
        r: event.rejected,
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

  return mdb.collections.appV4.bulkWrite(upsertOperations, { ordered: false });
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    _id: { $gte: buildId(key, date.start), $lt: buildId(key, date.end) },
  };

  const groupSumStatus = {
    _id: null,
    approved: { $sum: '$a' },
    noFunds: { $sum: '$n' },
    pending: { $sum: '$p' },
    rejected: { $sum: '$r' },
  };

  const pipeline = [
    {
      $match: docsFromKeyBetweenDate,
    },
    {
      $group: groupSumStatus,
    },
    {
      $project: { _id: 0 },
    },
  ];

  return mdb.collections.appV4
    .aggregate(pipeline)
    .toArray()
    .then(([result]) => result);
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const reportsInfo = getReportsInfo(date);

  const reports = reportsInfo.map(async ({ id, ...date }) => {
    return {
      id,
      ...date,
      totals: await getReport({ date, key }),
    };
  });

  return Promise.all(reports);
};
