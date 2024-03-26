/* eslint-disable sort-keys */
import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getReportsDates } from '../helpers';
import mdb from '../mdb';

const buildId = (key: string, date: Date): Buffer => {
  const dateFormatted = date.toISOString().split('T')[0].replace(/-/g, '');

  return Buffer.from(`${key}${dateFormatted.slice(0, 6)}`, 'hex');
};

const getDayFromDate = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '').slice(6);
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV5>>((doc) => {
    const query = { _id: buildId(doc.key, doc.date) };

    const dayNumber = getDayFromDate(doc.date);
    const mutation = {
      $inc: {
        [`items.${dayNumber}.a`]: doc.approved,
        [`items.${dayNumber}.n`]: doc.noFunds,
        [`items.${dayNumber}.p`]: doc.pending,
        [`items.${dayNumber}.r`]: doc.rejected,
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
  const [lowerDay, upperDay] = [
    date.start.getDate().toString(),
    date.end.getDate().toString(),
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
  const docsFromKeyBetweenDate = {
    _id: {
      $gte: buildId(key, date.start),
      $lt: buildId(key, date.end),
    },
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
