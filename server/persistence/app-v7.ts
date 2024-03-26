/* eslint-disable sort-keys */
import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getReportsDates } from '../helpers';
import mdb from '../mdb';

const getQuarter = (month: number): string => {
  if (month >= 0 && month <= 2) return '01';
  else if (month >= 3 && month <= 5) return '02';
  else if (month >= 6 && month <= 8) return '03';
  else return '04';
};

const buildId = (key: string, date: Date): Buffer => {
  const year = date.getFullYear();
  const quarter = getQuarter(date.getMonth());

  return Buffer.from(`${key}${year}${quarter}`, 'hex');
};

const getMonthDayFromDate = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '').slice(4);
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV7>>((doc) => {
    const query = { _id: buildId(doc.key, doc.date) };

    const monthDayNumber = getMonthDayFromDate(doc.date);
    const incrementItems = {
      [`items.${monthDayNumber}.a`]: doc.approved,
      [`items.${monthDayNumber}.n`]: doc.noFunds,
      [`items.${monthDayNumber}.p`]: doc.pending,
      [`items.${monthDayNumber}.r`]: doc.rejected,
    };
    const incrementReports = {
      'report.a': doc.approved,
      'report.n': doc.noFunds,
      'report.p': doc.pending,
      'report.r': doc.rejected,
    };
    const mutation = { $inc: { ...incrementItems, ...incrementReports } };

    return { updateOne: { filter: query, update: mutation, upsert: true } };
  });

  return mdb.collections.appV7.bulkWrite(upsertOperations, { ordered: false });
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
  const [lowerDay, upperDay] = [
    getMonthDayFromDate(date.start),
    getMonthDayFromDate(date.end),
  ];

  const InLowerYearMonthAndGteLowerDay = {
    $and: [{ $eq: ['$_id', lowerId] }, { $gte: ['$$this.k', lowerDay] }],
  };
  const InUpperYearMonthAndLtUpperDay = {
    $and: [{ $eq: ['$_id', upperId] }, { $lt: ['$$this.k', upperDay] }],
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
  const lowerId = buildId(key, date.start);
  const upperId = buildId(key, date.end);

  const docsFromKeyBetweenDate = {
    _id: {
      $gte: lowerId,
      $lt: upperId,
    },
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

  return mdb.collections.appV7
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
