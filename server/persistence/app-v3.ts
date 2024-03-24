import {
  type AnyBulkWriteOperation,
  type BulkWriteResult,
  type Document,
} from 'mongodb';

import type * as T from '../types';
import { getReportDates } from '../helpers';
import mdb from '../mdb';

const buildId = (key: string, date: Date): Buffer => {
  const dateFormatted = date.toISOString().split('T')[0].replace(/-/g, '');

  return Buffer.from(`${key}${dateFormatted}`, 'hex');
};

export const bulkUpsert = async (docs: T.Body): Promise<BulkWriteResult> => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV3>>((doc) => {
    return {
      updateOne: {
        filter: { _id: buildId(doc.key, doc.date) },
        update: {
          $inc: {
            approved: doc.approved,
            noFunds: doc.noFunds,
            pending: doc.pending,
            rejected: doc.rejected,
          },
        },
        upsert: true,
      },
    };
  });

  return mdb.collections.appV3.bulkWrite(upsertOperations, { ordered: false });
};

export const getReport = async (filter: {
  date: { end: Date; start: Date };
  key: string;
}): Promise<Document> => {
  const lowerId = buildId(filter.key, filter.date.start);
  const upperId = buildId(filter.key, filter.date.end);
  const [result] = await mdb.collections.appV3
    .aggregate([
      {
        $match: {
          _id: { $gte: lowerId, $lt: upperId },
        },
      },
      {
        $group: {
          _id: null,
          approved: { $sum: '$approved' },
          noFunds: { $sum: '$noFunds' },
          pending: { $sum: '$pending' },
          rejected: { $sum: '$rejected' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .toArray();

  return result;
};

export const getReports = async ({
  date,
  key,
}: {
  date: Date;
  key: string;
}): Promise<Document[]> => {
  const reportDates = getReportDates(date);

  return Promise.all(reportDates.map(async (date) => getReport({ date, key })));
};
