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
  const QQ = getQuarter(date.getMonth());

  return Buffer.from(`${key}${year}${QQ}`, 'hex');
};

const getYYYYMMDDFromDate = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '');
};

export const bulkUpsert: T.BulkUpsert = async (docs) => {
  const upsertOperations = docs.map<AnyBulkWriteOperation<T.DocV8>>((doc) => {
    const query = { _id: buildId(doc.key, doc.date) };

    const YYYYMMDD = getYYYYMMDDFromDate(doc.date);
    const mutation = {
      $inc: {
        [`items.${YYYYMMDD}.a`]: doc.approved,
        [`items.${YYYYMMDD}.n`]: doc.noFunds,
        [`items.${YYYYMMDD}.p`]: doc.pending,
        [`items.${YYYYMMDD}.r`]: doc.rejected,
      },
    };

    return { updateOne: { filter: query, update: mutation, upsert: true } };
  });

  return mdb.collections.appV8.bulkWrite(upsertOperations, { ordered: false });
};

const buildFieldAccumulator = (
  field: string,
  reportYear: string
): Record<string, unknown> => {
  return {
    $add: [
      `$$value.${reportYear}.${field}`,
      { $cond: [`$$this.v.${field}`, `$$this.v.${field}`, 0] },
    ],
  };
};

const buildReportAccumulator = (
  dateRange: T.ReportYear
): Record<T.ReportYear, unknown> => {
  const base: Record<T.ReportYear, unknown> = {
    oneYear: ['oneYear'].includes(dateRange)
      ? {
          a: buildFieldAccumulator('a', 'oneYear'),
          n: buildFieldAccumulator('n', 'oneYear'),
          p: buildFieldAccumulator('p', 'oneYear'),
          r: buildFieldAccumulator('r', 'oneYear'),
        }
      : '$$value.oneYear',
    threeYears: ['oneYear', 'threeYears'].includes(dateRange)
      ? {
          a: buildFieldAccumulator('a', 'threeYears'),
          n: buildFieldAccumulator('n', 'threeYears'),
          p: buildFieldAccumulator('p', 'threeYears'),
          r: buildFieldAccumulator('r', 'threeYears'),
        }
      : '$$value.threeYears',
    fiveYears: ['oneYear', 'threeYears', 'fiveYears'].includes(dateRange)
      ? {
          a: buildFieldAccumulator('a', 'fiveYears'),
          n: buildFieldAccumulator('n', 'fiveYears'),
          p: buildFieldAccumulator('p', 'fiveYears'),
          r: buildFieldAccumulator('r', 'fiveYears'),
        }
      : '$$value.fiveYears',
    sevenYears: ['oneYear', 'threeYears', 'fiveYears', 'sevenYears'].includes(
      dateRange
    )
      ? {
          a: buildFieldAccumulator('a', 'sevenYears'),
          n: buildFieldAccumulator('n', 'sevenYears'),
          p: buildFieldAccumulator('p', 'sevenYears'),
          r: buildFieldAccumulator('r', 'sevenYears'),
        }
      : '$$value.sevenYears',
    tenYears: [
      'oneYear',
      'threeYears',
      'fiveYears',
      'sevenYears',
      'tenYears',
    ].includes(dateRange)
      ? {
          a: buildFieldAccumulator('a', 'tenYears'),
          n: buildFieldAccumulator('n', 'tenYears'),
          p: buildFieldAccumulator('p', 'tenYears'),
          r: buildFieldAccumulator('r', 'tenYears'),
        }
      : '$$value.tenYears',
  };

  return base;
};

const buildLoopLogic = (
  reportDates: Array<{ id: T.ReportYear; end: Date; start: Date }>
): Record<string, unknown> => {
  const YYYYMMDDUpper = getYYYYMMDDFromDate(reportDates[0].end);
  const YYYYMMDDOneYear = getYYYYMMDDFromDate(reportDates[0].start);
  const YYYYMMDDThreeYears = getYYYYMMDDFromDate(reportDates[1].start);
  const YYYYMMDDFiveYears = getYYYYMMDDFromDate(reportDates[2].start);
  const YYYYMMDDSevenYears = getYYYYMMDDFromDate(reportDates[3].start);
  const YYYYMMDDTenYears = getYYYYMMDDFromDate(reportDates[4].start);

  const IsInOneYear = {
    $and: [
      { $gte: ['$$this.k', YYYYMMDDOneYear] },
      { $lt: ['$$this.k', YYYYMMDDUpper] },
    ],
  };
  const IsInThreeYears = {
    $and: [
      { $gte: ['$$this.k', YYYYMMDDThreeYears] },
      { $lt: ['$$this.k', YYYYMMDDUpper] },
    ],
  };
  const IsInFiveYears = {
    $and: [
      { $gte: ['$$this.k', YYYYMMDDFiveYears] },
      { $lt: ['$$this.k', YYYYMMDDUpper] },
    ],
  };
  const IsInSevenYears = {
    $and: [
      { $gte: ['$$this.k', YYYYMMDDSevenYears] },
      { $lt: ['$$this.k', YYYYMMDDUpper] },
    ],
  };
  const IsInTenYears = {
    $and: [
      { $gte: ['$$this.k', YYYYMMDDTenYears] },
      { $lt: ['$$this.k', YYYYMMDDUpper] },
    ],
  };

  return {
    $switch: {
      branches: [
        { case: IsInOneYear, then: buildReportAccumulator('oneYear') },
        { case: IsInThreeYears, then: buildReportAccumulator('threeYears') },
        { case: IsInFiveYears, then: buildReportAccumulator('fiveYears') },
        { case: IsInSevenYears, then: buildReportAccumulator('sevenYears') },
        { case: IsInTenYears, then: buildReportAccumulator('tenYears') },
      ],
      default: '$$value',
    },
  };
};
export const getReports: T.GetReports = async ({ date, key }) => {
  const reportDates = getReportsDates(date);

  const docsFromKeyBetweenDate = {
    _id: {
      $gte: buildId(key, reportDates[4].start),
      $lte: buildId(key, reportDates[4].end),
    },
  };

  const initialReportValue = {
    oneYear: { a: 0, n: 0, p: 0, r: 0 },
    threeYears: { a: 0, n: 0, p: 0, r: 0 },
    fiveYears: { a: 0, n: 0, p: 0, r: 0 },
    sevenYears: { a: 0, n: 0, p: 0, r: 0 },
    tenYears: { a: 0, n: 0, p: 0, r: 0 },
  };
  const buildReportField = {
    $reduce: {
      input: { $objectToArray: '$items' },
      initialValue: initialReportValue,
      in: buildLoopLogic(reportDates),
    },
  };

  const groupCountItems = {
    _id: null,

    oneYearApproved: { $sum: '$report.oneYear.a' },
    oneYearNoFunds: { $sum: '$report.oneYear.n' },
    oneYearPending: { $sum: '$report.oneYear.p' },
    oneYearRejected: { $sum: '$report.oneYear.r' },

    threeYearsApproved: { $sum: '$report.threeYears.a' },
    threeYearsNoFunds: { $sum: '$report.threeYears.n' },
    threeYearsPending: { $sum: '$report.threeYears.p' },
    threeYearsRejected: { $sum: '$report.threeYears.r' },

    fiveYearsApproved: { $sum: '$report.fiveYears.a' },
    fiveYearsNoFunds: { $sum: '$report.fiveYears.n' },
    fiveYearsPending: { $sum: '$report.fiveYears.p' },
    fiveYearsRejected: { $sum: '$report.fiveYears.r' },

    sevenYearsApproved: { $sum: '$report.sevenYears.a' },
    sevenYearsNoFunds: { $sum: '$report.sevenYears.n' },
    sevenYearsPending: { $sum: '$report.sevenYears.p' },
    sevenYearsRejected: { $sum: '$report.sevenYears.r' },

    tenYearsApproved: { $sum: '$report.tenYears.a' },
    tenYearsNoFunds: { $sum: '$report.tenYears.n' },
    tenYearsPending: { $sum: '$report.tenYears.p' },
    tenYearsRejected: { $sum: '$report.tenYears.r' },
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
    { $addFields: { report: buildReportField } },
    { $group: groupCountItems },
    { $project: format },
  ];

  const result = await mdb.collections.appV8
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
