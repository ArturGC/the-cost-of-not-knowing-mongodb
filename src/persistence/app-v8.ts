import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import {
  buildFieldAccumulator,
  buildKey,
  getMM,
  getMMDD,
  getReportsDates,
  getYYYY,
} from '../helpers';
import mdb from '../mdb';

// Implementação utilizando Array

const buildId = (key: number, date: Date): Buffer => {
  const id = `${buildKey(key)}${getYYYY(date)}${getMM(date)}`;

  return Buffer.from(id, 'hex');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV6>>(
    (doc) => {
      const query = {
        _id: buildId(doc.key, doc.date),
      };

      const mutation = [
        {
          $set: {
            result: {
              $reduce: {
                input: {
                  $cond: ['$items', '$items', []],
                },
                initialValue: {
                  found: false,
                  items: [],
                },
                in: {
                  $cond: {
                    if: {
                      $not: { $eq: ['$$this.date', doc.date] },
                    },
                    then: {
                      found: '$$value.found',
                      items: { $concatArrays: ['$$value.items', ['$$this']] },
                    },
                    else: {
                      found: true,
                      items: {
                        $concatArrays: [
                          '$$value.items',
                          [
                            {
                              $switch: {
                                branches: [
                                  {
                                    case: { $and: [doc.a] },
                                    then: {
                                      date: '$$this.date',
                                      a: { $add: [doc.a, '$$this.a'] },
                                      n: '$$this.n',
                                      p: '$$this.p',
                                      r: '$$this.r',
                                    },
                                  },
                                  {
                                    case: { $and: [doc.n] },
                                    then: {
                                      date: '$$this.date',
                                      a: '$$this.a',
                                      n: { $add: [doc.n, '$$this.n'] },
                                      p: '$$this.p',
                                      r: '$$this.r',
                                    },
                                  },
                                  {
                                    case: { $and: [doc.p] },
                                    then: {
                                      date: '$$this.date',
                                      a: '$$this.a',
                                      n: '$$this.n',
                                      p: { $add: [doc.p, '$$this.p'] },
                                      r: '$$this.r',
                                    },
                                  },
                                  {
                                    case: { $and: [doc.r] },
                                    then: {
                                      date: '$$this.date',
                                      a: '$$this.a',
                                      n: '$$this.n',
                                      p: '$$this.p',
                                      r: { $add: [doc.r, '$$this.r'] },
                                    },
                                  },
                                ],
                                default: {
                                  date: '$$this.date',
                                  a: '$$this.a',
                                  n: '$$this.n',
                                  p: '$$this.p',
                                  r: '$$this.r',
                                },
                              },
                            },
                          ],
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $set: {
            items: {
              $cond: {
                if: '$result.found',
                then: '$result.items',
                else: {
                  $concatArrays: [
                    { $cond: ['$items', '$items', []] },
                    [
                      {
                        date: doc.date,
                        a: doc.a,
                        n: doc.n,
                        p: doc.p,
                        r: doc.r,
                      },
                    ],
                  ],
                },
              },
            },
          },
        },
        {
          $unset: ['result'],
        },
      ];

      return {
        updateOne: {
          filter: query,
          update: mutation,
          upsert: true,
        },
      };
    }
  );

  return mdb.collections.appV8.bulkWrite(upsertOperations, { ordered: false });
};

const buildLoopLogic = (
  key: number,
  date: { end: Date; start: Date }
): Record<string, unknown> => {
  const [lowerId, lowerMMDD] = [buildId(key, date.start), getMMDD(date.start)];
  const [upperId, upperMMDD] = [buildId(key, date.end), getMMDD(date.end)];

  const InLowerYYYYMMAndGteLowerMMDD = {
    $and: [{ $eq: ['$_id', lowerId] }, { $gte: ['$$this.k', lowerMMDD] }],
  };
  const InUpperYYYYMMAndLtUpperDD = {
    $and: [{ $eq: ['$_id', upperId] }, { $lt: ['$$this.k', upperMMDD] }],
  };
  const BetweenLowerAndUpperYYYYMM = {
    $and: [{ $gt: ['$_id', lowerId] }, { $lt: ['$_id', upperId] }],
  };

  return {
    $cond: {
      if: {
        $or: [
          InLowerYYYYMMAndGteLowerMMDD,
          BetweenLowerAndUpperYYYYMM,
          InUpperYYYYMMAndLtUpperDD,
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
      input: '$items',
      initialValue: { a: 0, n: 0, p: 0, r: 0 },
      in: {
        $cond: {
          if: {
            $and: [
              { $gte: ['$$this.date', date.start] },
              { $lt: ['$$this.date', date.end] },
            ],
          },
          then: {
            a: { $add: ['$$value.a', { $cond: ['$$this.a', '$$this.a', 0] }] },
            n: { $add: ['$$value.n', { $cond: ['$$this.n', '$$this.n', 0] }] },
            p: { $add: ['$$value.p', { $cond: ['$$this.p', '$$this.p', 0] }] },
            r: { $add: ['$$value.r', { $cond: ['$$this.r', '$$this.r', 0] }] },
          },
          else: '$$value',
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

  return mdb.collections.appV8
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
