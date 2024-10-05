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
    const newReportFields = itemsArray.buildNewTotals(event);
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

  const betweenLowerAndUpperYearQuarter = {
    $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
  };
  const buildTotalsField = {
    totals: {
      $cond: {
        if: betweenLowerAndUpperYearQuarter,
        then: '$totals',
        else: {
          $reduce: {
            input: '$items',
            initialValue: { a: 0, n: 0, p: 0, r: 0 },
            in: buildReduceLoopLogic(date),
          },
        },
      },
    },
  };

  const groupSumTotals = {
    _id: null,
    approved: { $sum: '$totals.a' },
    noFunds: { $sum: '$totals.n' },
    pending: { $sum: '$totals.p' },
    rejected: { $sum: '$totals.r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $addFields: buildTotalsField },
    { $group: groupSumTotals },
    { $project: { _id: 0 } },
  ];

  return mdb.collections.appV5R4
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
