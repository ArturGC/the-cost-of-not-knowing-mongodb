/* eslint-disable sort-keys */
import {
  type AnyBulkWriteOperation,
  type BulkWriteResult,
  type Document,
} from 'mongodb';

import type * as T from '../types';
import mdb from '../mdb';

const buildId = (key: string, date: Date): string => {
  const dateFormatted = date
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '')
    .slice(0, 6);

  return `${key}${dateFormatted}`;
  // return Buffer.from(`${key}${dateFormatted}`, 'hex');
};

const buildIdDate = (key: string, date: Date): string => {
  const dateFormatted = date.toISOString().split('T')[0].replace(/-/g, '');

  return `${key}${dateFormatted}`;
  // return Buffer.from(`${key}${dateFormatted}`, 'hex');
};

const getDayFromDate = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '').slice(6);
};

export const bulkUpsert = async (docs: T.Body): Promise<BulkWriteResult> => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV5>>((doc) => {
    const dayNumber = getDayFromDate(doc.date);

    return {
      updateOne: {
        filter: {
          _id: buildId(doc.key, doc.date),
        },
        update: {
          $inc: {
            [`items.${dayNumber}.a`]: doc.approved,
            [`items.${dayNumber}.n`]: doc.noFunds,
            [`items.${dayNumber}.p`]: doc.pending,
            [`items.${dayNumber}.r`]: doc.rejected,
          },
        },
        upsert: true,
      },
    };
  });

  return mdb.collections.appV5.bulkWrite(upsertOperations, { ordered: false });
};

const buildOperatorForType = (
  type: string,
  key: string,
  date: { end: Date; start: Date }
): Document => {
  const lowerIdDate = buildIdDate(key, date.start);
  const upperIdDate = buildIdDate(key, date.end);

  return {
    $add: [
      {
        $cond: [
          {
            $and: [
              `$$this.v.${type}`,
              { $gte: [{ $concat: ['$_id', '$$this.k'] }, lowerIdDate] },
              { $lt: [{ $concat: ['$_id', '$$this.k'] }, upperIdDate] },
            ],
          },
          `$$this.v.${type}`,
          0,
        ],
      },
      `$$value.${type}`,
    ],
  };
};

export const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document[]> => {
  const lowerId = buildId(filter.key, filter.date.start);
  const upperId = buildId(filter.key, filter.date.end);

  return mdb.collections.appV5
    .aggregate([
      {
        $match: {
          _id: { $gte: lowerId, $lte: upperId },
        },
      },
      // {
      //   $addFields: {
      //     items: { $objectToArray: '$items' },
      //   },
      // },
      {
        $addFields: {
          report: {
            $reduce: {
              input: { $objectToArray: '$items' },
              initialValue: { a: 0, n: 0, p: 0, r: 0 },
              in: {
                a: buildOperatorForType('a', filter.key, filter.date),
                n: buildOperatorForType('n', filter.key, filter.date),
                p: buildOperatorForType('p', filter.key, filter.date),
                r: buildOperatorForType('r', filter.key, filter.date),
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          approved: { $sum: '$report.a' },
          noFunds: { $sum: '$report.n' },
          pending: { $sum: '$report.p' },
          rejected: { $sum: '$report.r' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .toArray();
};
