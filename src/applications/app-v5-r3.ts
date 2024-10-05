import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getQQ, getReportsInfo, getYYYY, itemsArray } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: string, date: Date): Buffer => {
  return Buffer.from(`${key}${getYYYY(date)}${getQQ(date)}`, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (events) => {
  const upsertOperations = events.map<AnyBulkWriteOperation<T.SchemaV5R1>>((event) => {
    const query = {
      _id: buildId(event.key, event.date),
    };

    const sumIfItemExists = itemsArray.buildResultIfItemExists(event);
    const returnItemsOrCreateNew = itemsArray.buildItemsOrCreateNew(event);
    const mutation = [
      { $set: { result: sumIfItemExists } },
      { $set: { items: returnItemsOrCreateNew } },
      { $unset: ['result'] },
    ];

    return {
      updateOne: {
        filter: query,
        update: mutation,
        upsert: true,
      },
    };
  });

  return mdb.collections.appV5R3.bulkWrite(upsertOperations, { ordered: false });
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    _id: { $gte: buildId(key, date.start), $lte: buildId(key, date.end) },
  };

  const itemsReduceAccumulator = {
    totals: itemsArray.buildItemsReduceAccumulator({ date }),
  };

  const groupSumStatus = {
    _id: null,
    approved: { $sum: '$totals.a' },
    noFunds: { $sum: '$totals.n' },
    pending: { $sum: '$totals.p' },
    rejected: { $sum: '$totals.r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $addFields: itemsReduceAccumulator },
    { $group: groupSumStatus },
    { $project: { _id: 0 } },
  ];

  return mdb.collections.appV5R3
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
