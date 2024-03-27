/* eslint-disable sort-keys */
import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getReportsDates } from '../helpers';
import mdb from '../mdb';

const buildId = (key: string, date: Date): Buffer => {
  const YYYYMM = date.toISOString().split('T')[0].replace(/-/g, '').slice(0, 6);

  return Buffer.from(`${key}${YYYYMM}`, 'hex');
};

const getDayFromDate = (date: Date): string => {
  return date.getDate().toString().padStart(2, '0');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV5>>((doc) => {
    const query = { _id: buildId(doc.key, doc.date) };

    const DD = getDayFromDate(doc.date);
    const mutation = {
      $inc: {
        [`items.${DD}.a`]: doc.approved,
        [`items.${DD}.n`]: doc.noFunds,
        [`items.${DD}.p`]: doc.pending,
        [`items.${DD}.r`]: doc.rejected,
      },
    };

    return { updateOne: { filter: query, update: mutation, upsert: true } };
  });

  return mdb.collections.appV5.bulkWrite(upsertOperations, { ordered: false });
};

const buildFieldAccumulator = (field: string): Record<string, unknown> => {
  return {
    $add: [
      `$$value.${field}`,
      { $cond: [`$$this.v.${field}`, `$$this.v.${field}`, 0] },
    ],
  };
};

const buildLoopLogic = (
  key: string,
  date: { end: Date; start: Date }
): Record<string, unknown> => {
  const [lowerId, upperId] = [buildId(key, date.start), buildId(key, date.end)];
  const [lowerDD, upperDD] = [
    getDayFromDate(date.start),
    getDayFromDate(date.end),
  ];

  const InLowerYearMonthAndGteLowerDay = {
    $and: [{ $eq: ['$_id', lowerId] }, { $gte: ['$$this.k', lowerDD] }],
  };
  const InUpperYearMonthAndLtUpperDay = {
    $and: [{ $eq: ['$_id', upperId] }, { $lt: ['$$this.k', upperDD] }],
  };
  const BetweenLowerAndUpperYearMonths = {
    $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
  };

  return {
    $cond: {
      if: {
        $or: [
          InLowerYearMonthAndGteLowerDay,
          BetweenLowerAndUpperYearMonths,
          InUpperYearMonthAndLtUpperDay,
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

  return mdb.collections.appV5
    .aggregate(pipeline)
    .toArray()
    .then(([result]) => result);
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const dates = getReportsDates(date);

  return Promise.all(
    dates.map(async (date) => {
      return { ...date, report: await getReport({ date, key }) };
    })
  );
};
