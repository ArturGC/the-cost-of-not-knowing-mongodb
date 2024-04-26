import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getDD, getMM, getReportsDates, getYYYY, ItemsObj } from '../helpers';
import mdb from '../mdb';

export const buildId = (key: string, date: Date): Buffer => {
  const id = `${key}${getYYYY(date)}${getMM(date)}`;

  return Buffer.from(id, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV5R0>>((doc) => {
    const query = {
      _id: buildId(doc.key, doc.date),
    };

    const DD = getDD(doc.date);
    const mutation = {
      $inc: {
        [`items.${DD}.a`]: doc.approved,
        [`items.${DD}.n`]: doc.noFunds,
        [`items.${DD}.p`]: doc.pending,
        [`items.${DD}.r`]: doc.rejected,
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

  return mdb.collections.appV6R0.bulkWrite(upsertOperations, {
    ordered: false,
  });
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

  const buildReportField = {
    $reduce: {
      input: { $objectToArray: '$items' },
      initialValue: { a: 0, n: 0, p: 0, r: 0 },
      in: buildReduceLoopLogic(key, date),
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

  return mdb.collections.appV6R0
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
