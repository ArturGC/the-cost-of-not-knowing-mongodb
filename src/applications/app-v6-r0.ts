import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getDD, getMM, getReportsInfo, getYYYY, ItemsObj } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: string, date: Date): Buffer => {
  return Buffer.from(`${key}${getYYYY(date)}${getMM(date)}`, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (events) => {
  const upsertOperations = events.map<AnyBulkWriteOperation<T.SchemaV6R0>>((event) => {
    const query = {
      _id: buildId(event.key, event.date),
    };

    const DD = getDD(event.date);
    const mutation = {
      $inc: {
        [`items.${DD}.a`]: event.approved,
        [`items.${DD}.n`]: event.noFunds,
        [`items.${DD}.p`]: event.pending,
        [`items.${DD}.r`]: event.rejected,
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

  return mdb.collections.appV6R0.bulkWrite(upsertOperations, { ordered: false });
};

const buildReduceLoopLogic = (key: string, date: { end: Date; start: Date }): Record<string, unknown> => {
  const [lowerId, lowerDD] = [buildId(key, date.start), getDD(date.start)];
  const [upperId, upperDD] = [buildId(key, date.end), getDD(date.end)];

  const InLowerYYYYMMAndGteLowerDD = {
    $and: [{ $eq: ['$_id', lowerId] }, { $gte: ['$$this.k', lowerDD] }],
  };
  const InUpperYYYYMMAndLtUpperDD = {
    $and: [{ $eq: ['$_id', upperId] }, { $lt: ['$$this.k', upperDD] }],
  };
  const BetweenLowerAndUpperYYYYMM = {
    $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
  };

  return {
    $cond: {
      if: {
        $or: [InLowerYYYYMMAndGteLowerDD, BetweenLowerAndUpperYYYYMM, InUpperYYYYMMAndLtUpperDD],
      },
      then: {
        a: ItemsObj.buildFieldAccumulator('a'),
        n: ItemsObj.buildFieldAccumulator('n'),
        p: ItemsObj.buildFieldAccumulator('p'),
        r: ItemsObj.buildFieldAccumulator('r'),
      },
      else: '$$value',
    },
  };
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    _id: { $gte: buildId(key, date.start), $lte: buildId(key, date.end) },
  };

  const buildTotalsField = {
    totals: {
      $reduce: {
        input: { $objectToArray: '$items' },
        initialValue: { a: 0, n: 0, p: 0, r: 0 },
        in: buildReduceLoopLogic(key, date),
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

  return mdb.collections.appV6R0
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
