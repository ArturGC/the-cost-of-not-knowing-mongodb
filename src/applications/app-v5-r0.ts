import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getMM, getReportsInfo, getYYYY } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: string, date: Date): Buffer => {
  return Buffer.from(`${key}${getYYYY(date)}${getMM(date)}`, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (events) => {
  const upsertOperations = events.map<AnyBulkWriteOperation<T.SchemaV5R0>>((event) => {
    const query = {
      _id: buildId(event.key, event.date),
    };

    const mutation = {
      $push: {
        items: {
          date: event.date,
          a: event.approved,
          n: event.noFunds,
          p: event.pending,
          r: event.rejected,
        },
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

  return mdb.collections.appV5R0.bulkWrite(upsertOperations, { ordered: false });
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    _id: { $gte: buildId(key, date.start), $lte: buildId(key, date.end) },
  };

  const unwindItemsArray = {
    path: '$items',
    preserveNullAndEmptyArrays: false,
  };

  const itemsBetweenDates = {
    'items.date': { $gte: date.start, $lt: date.end },
  };

  const groupSumStatus = {
    _id: null,
    approved: { $sum: '$items.a' },
    noFunds: { $sum: '$items.n' },
    pending: { $sum: '$items.p' },
    rejected: { $sum: '$items.r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $unwind: unwindItemsArray },
    { $match: itemsBetweenDates },
    { $group: groupSumStatus },
    { $project: { _id: 0 } },
  ];

  return mdb.collections.appV5R0
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
