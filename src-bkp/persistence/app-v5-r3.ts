import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { buildKey, getQQ, getReportsDates, getYYYY, itemsArray } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: number, date: Date): Buffer => {
  const id = `${buildKey(key)}${getYYYY(date)}${getQQ(date)}`;

  return Buffer.from(id, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV4R1>>((doc) => {
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

  return mdb.collections.appV5R3.bulkWrite(upsertOperations, {
    ordered: false,
  });
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    _id: { $gte: buildId(key, date.start), $lte: buildId(key, date.end) },
  };

  const itemsReduceAccumulator = itemsArray.buildItemsReduceAccumulator({
    date,
  });

  const groupSumReports = {
    _id: null,
    approved: { $sum: '$report.a' },
    noFunds: { $sum: '$report.n' },
    pending: { $sum: '$report.p' },
    rejected: { $sum: '$report.r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $addFields: { report: itemsReduceAccumulator } },
    { $group: groupSumReports },
    { $project: { _id: 0 } },
  ];

  return mdb.collections.appV5R3
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
