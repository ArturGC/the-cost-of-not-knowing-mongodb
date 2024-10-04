import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getMMDD, getQQ, getReportsDates, getYYYY, ItemsObj } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: string, date: Date): Buffer => {
  return Buffer.from(`${key}${getYYYY(date)}${getQQ(date)}`, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (events) => {
  const upsertOperations = events.map<AnyBulkWriteOperation<T.SchemaV6R1>>((event) => {
    const query = { _id: buildId(event.key, event.date) };

    const MMDD = getMMDD(event.date);
    const incrementItems = {
      [`items.${MMDD}.a`]: event.approved,
      [`items.${MMDD}.n`]: event.noFunds,
      [`items.${MMDD}.p`]: event.pending,
      [`items.${MMDD}.r`]: event.rejected,
    };
    const incrementReports = {
      'report.a': event.approved,
      'report.n': event.noFunds,
      'report.p': event.pending,
      'report.r': event.rejected,
    };
    const mutation = {
      $inc: {
        ...incrementItems,
        ...incrementReports,
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

  return mdb.collections.appV6R2.bulkWrite(upsertOperations, {
    ordered: false,
  });
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
          input: { $objectToArray: '$items' },
          initialValue: { a: 0, n: 0, p: 0, r: 0 },
          in: buildLoopLogic(key, date),
        },
      },
    },
  };

  const groupCountItems = {
    _id: null,
    approved: { $sum: '$report.a' },
    noFunds: { $sum: '$report.n' },
    pending: { $sum: '$report.p' },
    rejected: { $sum: '$report.r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $addFields: { report: buildReportField } },
    { $group: groupCountItems },
    { $project: { _id: 0 } },
  ];

  return mdb.collections.appV6R2
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
