import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getMMDD, getQQ, getReportsInfo, getYYYY, ItemsObj } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: string, date: Date): Buffer => {
  return Buffer.from(`${key}${getYYYY(date)}${getQQ(date)}`, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (events) => {
  const upsertOperations = events.map<AnyBulkWriteOperation<T.SchemaV6R0>>((event) => {
    const query = {
      _id: buildId(event.key, event.date),
    };

    const MMDD = getMMDD(event.date);
    const mutation = {
      $inc: {
        [`items.${MMDD}.a`]: event.approved,
        [`items.${MMDD}.n`]: event.noFunds,
        [`items.${MMDD}.p`]: event.pending,
        [`items.${MMDD}.r`]: event.rejected,
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

  return mdb.collections.appV6R1.bulkWrite(upsertOperations, { ordered: false });
};

const buildLoopLogic = (key: string, date: { end: Date; start: Date }): Record<string, unknown> => {
  const [lowerId, lowerMMDD] = [buildId(key, date.start), getMMDD(date.start)];
  const [upperId, upperMMDD] = [buildId(key, date.end), getMMDD(date.end)];

  const InLowerYYYYQQAndGteLowerMMDD = {
    $and: [{ $eq: ['$_id', lowerId] }, { $gte: ['$$this.k', lowerMMDD] }],
  };
  const InUpperYYYYQQAndLtUpperMMDD = {
    $and: [{ $eq: ['$_id', upperId] }, { $lt: ['$$this.k', upperMMDD] }],
  };
  const BetweenLowerAndUpperYYYYQQ = {
    $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
  };

  return {
    $cond: {
      if: {
        $or: [InLowerYYYYQQAndGteLowerMMDD, BetweenLowerAndUpperYYYYQQ, InUpperYYYYQQAndLtUpperMMDD],
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
        in: buildLoopLogic(key, date),
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

  return mdb.collections.appV6R1
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
