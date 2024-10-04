import { type AnyBulkWriteOperation } from 'mongodb';

import type * as T from '../types';
import { getReportsDates } from '../helpers';
import mdb from '../mdb';

export const bulkUpsert: T.BulkUpsert = async (events) => {
  const upsertOperations = events.map<AnyBulkWriteOperation<T.SchemaV1>>((event) => {
    const query = {
      _id: {
        date: event.date,
        key: event.key,
      },
    };

    const mutation = {
      $inc: {
        approved: event.approved,
        noFunds: event.noFunds,
        pending: event.pending,
        rejected: event.rejected,
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

  return mdb.collections.appV1.bulkWrite(upsertOperations, { ordered: false });
};

const getReport: T.GetReport = async ({ date, key }) => {
  const docsFromKeyBetweenDate = {
    '_id.key': key,
    '_id.date': { $gte: date.start, $lt: date.end },
  };

  const groupCountItems = {
    _id: null,
    approved: { $sum: '$approved' },
    noFunds: { $sum: '$noFunds' },
    pending: { $sum: '$pending' },
    rejected: { $sum: '$rejected' },
  };

  const pipeline = [{ $match: docsFromKeyBetweenDate }, { $group: groupCountItems }, { $project: { _id: 0 } }];

  return mdb.collections.appV1
    .aggregate(pipeline)
    .toArray()
    .then(([result]) => result);
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const reportsDates = getReportsDates(date);

  const reports = reportsDates.map(async (date) => {
    return {
      ...date,
      report: await getReport({ date, key }),
    };
  });

  return Promise.all(reports);
};
