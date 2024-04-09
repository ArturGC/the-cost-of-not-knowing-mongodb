import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import {
  buildFieldAccumulatorFromArray,
  buildKey,
  getMM,
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
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.SchemaV6R0>>(
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
            a: buildFieldAccumulatorFromArray('a'),
            n: buildFieldAccumulatorFromArray('n'),
            p: buildFieldAccumulatorFromArray('p'),
            r: buildFieldAccumulatorFromArray('r'),
          },
          else: '$$value',
        },
      },
    },
  };

  const groupSumReports = {
    _id: null,
    approved: { $sum: '$report.a' },
    noFunds: { $sum: '$report.n' },
    pending: { $sum: '$report.p' },
    rejected: { $sum: '$report.r' },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $addFields: { report: buildReportField } },
    { $group: groupSumReports },
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
