import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import {
  buildFieldAccumulator,
  buildKey,
  getMMDD,
  getQQ,
  getReportsDates,
  getYYYY,
} from '../helpers';
import mdb from '../mdb';

const buildId = (key: number, date: Date): Buffer => {
  const id = `${buildKey(key)}${getYYYY(date)}${getQQ(date)}`;

  return Buffer.from(id, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV4>>(
    (doc) => {
      const query = {
        _id: buildId(doc.key, doc.date),
      };

      const MMDD = getMMDD(doc.date);
      const mutation = {
        $inc: {
          [`items.${MMDD}.a`]: doc.a,
          [`items.${MMDD}.n`]: doc.n,
          [`items.${MMDD}.p`]: doc.p,
          [`items.${MMDD}.r`]: doc.r,
        },
      };

      return {
        updateOne: {
          filter: query,
          update: mutation,
          upsert: true,
        },
      };
    }
  );

  return mdb.collections.appV6.bulkWrite(upsertOperations, { ordered: false });
};

const buildLoopLogic = (
  key: number,
  date: { end: Date; start: Date }
): Record<string, unknown> => {
  const [lowerId, lowerMMDD] = [buildId(key, date.start), getMMDD(date.start)];
  const [upperId, upperMMDD] = [buildId(key, date.end), getMMDD(date.end)];

  const InLowerYYYYQQAndGteLowerMMDD = {
    $and: [{ $eq: ['$_id', lowerId] }, { $gte: ['$$this.k', lowerMMDD] }],
  };
  const InUpperYYYYQQAndLtUpperDD = {
    $and: [{ $eq: ['$_id', upperId] }, { $lt: ['$$this.k', upperMMDD] }],
  };
  const BetweenLowerAndUpperYYYYQQ = {
    $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
  };

  return {
    $cond: {
      if: {
        $or: [
          InLowerYYYYQQAndGteLowerMMDD,
          BetweenLowerAndUpperYYYYQQ,
          InUpperYYYYQQAndLtUpperDD,
        ],
      },
      then: {
        a: buildFieldAccumulator('a'),
        n: buildFieldAccumulator('n'),
        p: buildFieldAccumulator('p'),
        r: buildFieldAccumulator('r'),
      },
      else: '$$value',
    },
  };
};
const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    _id: { $gte: buildId(key, date.start), $lte: buildId(key, date.end) },
  };

  const buildReportField = {
    $reduce: {
      input: { $objectToArray: '$items' },
      initialValue: { a: 0, n: 0, p: 0, r: 0 },
      in: buildLoopLogic(key, date),
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

  return mdb.collections.appV6
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
