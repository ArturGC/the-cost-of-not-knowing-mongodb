import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getQQ, getReportsDates, getYYYY, itemsArray } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: string, date: Date): Buffer => {
  const id = `${key}${getYYYY(date)}${getQQ(date)}`;

  return Buffer.from(id, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV5R0>>((doc) => {
    const query = {
      _id: buildId(doc.key, doc.date),
    };

    const sumIfItemExists = itemsArray.buildResultIfItemExists(doc);
    const returnItemsOrCreateNew = itemsArray.buildItemsOrCreateNew(doc);
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

  return mdb.collections.appV5R2.bulkWrite(upsertOperations, {
    ordered: false,
  });
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    _id: { $gte: buildId(key, date.start), $lte: buildId(key, date.end) },
  };

  const openItemsArray = {
    path: '$items',
    preserveNullAndEmptyArrays: false,
  };

  const itemsBetweenDates = {
    'items.date': { $gte: date.start, $lt: date.end },
  };

  const groupSumReports = {
    _id: null,
    approved: { $sum: '$items.a' },
    noFunds: { $sum: '$items.n' },
    pending: { $sum: '$items.p' },
    rejected: { $sum: '$items.r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $unwind: openItemsArray },
    { $match: itemsBetweenDates },
    { $group: groupSumReports },
    { $project: { _id: 0 } },
  ];

  return mdb.collections.appV5R2
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
