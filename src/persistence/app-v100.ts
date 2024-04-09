import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import {
  buildFieldAccumulatorFromObject,
  buildKey,
  getMMDD,
  getReportsDates,
  getSS,
  getYYYY,
} from '../helpers';
import mdb from '../mdb';

const buildId = (key: number, date: Date): Buffer => {
  return Buffer.from(`${buildKey(key)}${getYYYY(date)}${getSS(date)}`, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV5>>(
    (doc) => {
      const query = { _id: buildId(doc.key, doc.date) };

      const MMDD = getMMDD(doc.date);
      const incrementItems = {
        [`items.${MMDD}.a`]: doc.a,
        [`items.${MMDD}.n`]: doc.n,
        [`items.${MMDD}.p`]: doc.p,
        [`items.${MMDD}.r`]: doc.r,
      };
      const incrementReports = {
        'report.a': doc.a,
        'report.n': doc.n,
        'report.p': doc.p,
        'report.r': doc.r,
      };
      const mutation = {
        $inc: {
          ...incrementItems,
          ...incrementReports,
        },
      };

      return { updateOne: { filter: query, update: mutation, upsert: true } };
    }
  );

  return mdb.collections.appV10.bulkWrite(upsertOperations, { ordered: false });
};

const buildLoopLogic = (
  key: number,
  date: { end: Date; start: Date }
): Record<string, unknown> => {
  const [lowerId, upperId] = [buildId(key, date.start), buildId(key, date.end)];
  const [lowerMMDD, upperMMDD] = [getMMDD(date.start), getMMDD(date.end)];

  const InLowerYearQuarterAndGteLowerDay = {
    $and: [{ $eq: ['$_id', lowerId] }, { $gte: ['$$this.k', lowerMMDD] }],
  };
  const InUpperYearQuarterAndLtUpperDay = {
    $and: [{ $eq: ['$_id', upperId] }, { $lt: ['$$this.k', upperMMDD] }],
  };
  const BetweenLowerAndUpperYearQuarters = {
    $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
  };

  return {
    $cond: {
      if: {
        $or: [
          InLowerYearQuarterAndGteLowerDay,
          BetweenLowerAndUpperYearQuarters,
          InUpperYearQuarterAndLtUpperDay,
        ],
      },
      then: {
        a: buildFieldAccumulatorFromObject('a'),
        n: buildFieldAccumulatorFromObject('n'),
        p: buildFieldAccumulatorFromObject('p'),
        r: buildFieldAccumulatorFromObject('r'),
      },
      else: '$$value',
    },
  };
};

const getReport: T.GetReport = async ({ date, key }) => {
  const lowerId = buildId(key, date.start);
  const upperId = buildId(key, date.end);

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

  return mdb.collections.appV10
    .aggregate(pipeline)
    .toArray()
    .then(([result]) => result);
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const reportsDates = getReportsDates(date);

  return Promise.all(
    reportsDates.map(async (date) => {
      return { ...date, report: await getReport({ date, key }) };
    })
  );
};
