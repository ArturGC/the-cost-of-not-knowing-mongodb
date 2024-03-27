/* eslint-disable sort-keys */
import { type BulkWriteResult } from 'mongodb';

import type * as T from '../types';
import { getReportsDates } from '../helpers';
import mdb from '../mdb';

export const bulkUpsert = async (
  docs: T.Body
): Promise<BulkWriteResult | unknown> => {
  const docsV9 = docs.map<Omit<T.DocV10, '_id'>>((doc) => {
    return {
      date: doc.date,
      key: Buffer.from(doc.key, 'hex'),
      a: doc.approved,
      n: doc.noFunds,
      p: doc.pending,
      r: doc.rejected,
    };
  }) as T.DocV10[];

  return mdb.collections.appV10.insertMany(docsV9, { ordered: false });
};

const buildFieldSum = (
  date: { start: Date; end: Date },
  field: string
): Record<string, unknown> => {
  return {
    $cond: [
      { $and: [{ $gte: ['$date', date.start] }, { $lt: ['$date', date.end] }] },
      `$${field}`,
      0,
    ],
  };
};

export const getReports: T.GetReports = async ({ date, key }) => {
  const reportDates = getReportsDates(date);

  const docsFromKeyBetweenDate = {
    date: { $gte: reportDates[4].start, $lt: reportDates[4].end },
    key: Buffer.from(key, 'hex'),
  };

  const groupCountItems = {
    _id: null,
    oneYearApproved: { $sum: buildFieldSum(reportDates[0], 'a') },
    oneYearNoFunds: { $sum: buildFieldSum(reportDates[0], 'n') },
    oneYearPending: { $sum: buildFieldSum(reportDates[0], 'p') },
    oneYearRejected: { $sum: buildFieldSum(reportDates[0], 'r') },

    threeYearsApproved: { $sum: buildFieldSum(reportDates[1], 'a') },
    threeYearsNoFunds: { $sum: buildFieldSum(reportDates[1], 'n') },
    threeYearsPending: { $sum: buildFieldSum(reportDates[1], 'p') },
    threeYearsRejected: { $sum: buildFieldSum(reportDates[1], 'r') },

    fiveYearsApproved: { $sum: buildFieldSum(reportDates[2], 'a') },
    fiveYearsNoFunds: { $sum: buildFieldSum(reportDates[2], 'n') },
    fiveYearsPending: { $sum: buildFieldSum(reportDates[2], 'p') },
    fiveYearsRejected: { $sum: buildFieldSum(reportDates[2], 'r') },

    sevenYearsApproved: { $sum: buildFieldSum(reportDates[3], 'a') },
    sevenYearsNoFunds: { $sum: buildFieldSum(reportDates[3], 'n') },
    sevenYearsPending: { $sum: buildFieldSum(reportDates[3], 'p') },
    sevenYearsRejected: { $sum: buildFieldSum(reportDates[3], 'r') },

    tenYearsApproved: { $sum: buildFieldSum(reportDates[4], 'a') },
    tenYearsNoFunds: { $sum: buildFieldSum(reportDates[4], 'n') },
    tenYearsPending: { $sum: buildFieldSum(reportDates[4], 'p') },
    tenYearsRejected: { $sum: buildFieldSum(reportDates[4], 'r') },
  };

  const format = {
    _id: 0,
    oneYear: {
      approved: '$oneYearApproved',
      noFunds: '$oneYearNoFunds',
      pending: '$oneYearPending',
      rejected: '$oneYearRejected',
    },
    threeYears: {
      approved: '$threeYearsApproved',
      noFunds: '$threeYearsNoFunds',
      pending: '$threeYearsPending',
      rejected: '$threeYearsRejected',
    },
    fiveYears: {
      approved: '$fiveYearsApproved',
      noFunds: '$fiveYearsNoFunds',
      pending: '$fiveYearsPending',
      rejected: '$fiveYearsRejected',
    },
    sevenYears: {
      approved: '$sevenYearsApproved',
      noFunds: '$sevenYearsNoFunds',
      pending: '$sevenYearsPending',
      rejected: '$sevenYearsRejected',
    },
    tenYears: {
      approved: '$tenYearsApproved',
      noFunds: '$tenYearsNoFunds',
      pending: '$tenYearsPending',
      rejected: '$tenYearsRejected',
    },
  };

  const pipeline = [
    { $match: docsFromKeyBetweenDate },
    { $group: groupCountItems },
    { $project: format },
  ];

  const result = await mdb.collections.appV10
    .aggregate(pipeline)
    .toArray()
    .then(([result]) => result);

  return [
    {
      id: 'oneYear',
      end: reportDates[0].end,
      start: reportDates[0].start,
      report: result.oneYear,
    },
    {
      id: 'threeYears',
      end: reportDates[1].end,
      start: reportDates[1].start,
      report: result.threeYears,
    },
    {
      id: 'fiveYears',
      end: reportDates[2].end,
      start: reportDates[2].start,
      report: result.fiveYears,
    },
    {
      id: 'sevenYears',
      end: reportDates[3].end,
      start: reportDates[3].start,
      report: result.sevenYears,
    },
    {
      id: 'tenYears',
      end: reportDates[4].end,
      start: reportDates[4].start,
      report: result.tenYears,
    },
  ];
};
