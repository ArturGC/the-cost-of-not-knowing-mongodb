import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getQQ, getReportsDates, getYYYY, itemsArray } from '../helpers';
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
    const newReportFields = itemsArray.buildNewReport(event);
    const mutation = [
      { $set: { ...newReportFields, result: sumIfItemExists } },
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

  return mdb.collections.appV5R4.bulkWrite(upsertOperations, { ordered: false });
};

const buildReduceLoopLogic = (date: { end: Date; start: Date }): Record<string, unknown> => {
  return {
    $cond: {
      if: {
        $and: [{ $gte: ['$$this.date', date.start] }, { $lt: ['$$this.date', date.end] }],
      },
      then: {
        a: itemsArray.buildFieldAccumulator('a'),
        n: itemsArray.buildFieldAccumulator('n'),
        p: itemsArray.buildFieldAccumulator('p'),
        r: itemsArray.buildFieldAccumulator('r'),
      },
      else: '$$value',
    },
  };
};

const getReport: T.GetReport = async ({ date, key }) => {
  const [lowerId, upperId] = [buildId(key, date.start), buildId(key, date.end)];

  const docsFromKeyBetweenDate = {
    _id: { $gte: lowerId, $lte: upperId },
  };

  const BetweenLowerAndUpperYearQuarter = {
    $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
  };
  const buildReportField = {
    $cond: {
      if: BetweenLowerAndUpperYearQuarter,
      then: '$report',
      else: {
        $reduce: {
          input: '$items',
          initialValue: { a: 0, n: 0, p: 0, r: 0 },
          in: buildReduceLoopLogic(date),
        },
      },
    },
  };

  const groupSumReports = {
    _id: null,
    approved: { $sum: '$report.a' },
    noFunds: { $sum: '$report.n' },
    pending: { $sum: '$report.p' },
    rejected: { $sum: '$report.r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $addFields: { report: buildReportField } },
    { $group: groupSumReports },
    { $project: { _id: 0 } },
  ];

  return mdb.collections.appV5R4
    .aggregate(pipeline)
    .toArray()
    .then(([result]) => result);
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const reportsDates = getReportsDates(date);

  const reports = reportsDates.map(async (date) => {
    return {
      ...date,
      report: await getReport({ date, key }),
    };
  });

  return Promise.all(reports);
};
