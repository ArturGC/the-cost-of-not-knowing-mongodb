import * as T from '../src/types';

export const bulkKey = (1).toString(16).toUpperCase().padStart(64, '0');
export const eventsBulkUpsert: T.Event[][] = [
  [
    { date: new Date('2022-06-25'), key: bulkKey, approved: 1 },
    { date: new Date('2022-06-25'), key: bulkKey, approved: 1 },
    { date: new Date('2022-06-25'), key: bulkKey, noFunds: 1 },
    { date: new Date('2022-06-25'), key: bulkKey, noFunds: 1 },
  ],
  [
    { date: new Date('2022-06-15'), key: bulkKey, approved: 1, noFunds: 1 },
    { date: new Date('2022-06-15'), key: bulkKey, approved: 1, pending: 1 },
    { date: new Date('2022-06-15'), key: bulkKey, noFunds: 1, pending: 1 },
    { date: new Date('2022-06-15'), key: bulkKey, pending: 1, rejected: 1 },
  ],
  [
    { date: new Date('2022-05-15'), key: bulkKey, approved: 1, noFunds: 1 },
    { date: new Date('2022-05-15'), key: bulkKey, approved: 1, pending: 1 },
    { date: new Date('2022-05-15'), key: bulkKey, noFunds: 1, pending: 1 },
    { date: new Date('2022-05-15'), key: bulkKey, pending: 1, rejected: 1 },
  ],
];

export const reportDate = new Date('2022-06-15');
export const reportKey = (1).toString(16).toUpperCase().padStart(64, '0');

export const eventsGetReports: T.Event[] = [
  { date: new Date('2022-06-25'), key: reportKey, approved: 1 },
  { date: new Date('2022-06-15'), key: reportKey, approved: 1, noFunds: 1 },
  { date: new Date('2022-06-10'), key: reportKey, approved: 1, pending: 1 },
  { date: new Date('2022-06-05'), key: reportKey, approved: 1, rejected: 1 },

  { date: new Date('2021-06-25'), key: reportKey, approved: 1 },
  { date: new Date('2021-06-15'), key: reportKey, approved: 1, noFunds: 1 },
  { date: new Date('2021-06-10'), key: reportKey, approved: 1, pending: 1 },
  { date: new Date('2021-06-05'), key: reportKey, approved: 1, rejected: 1 },

  { date: new Date('2019-06-25'), key: reportKey, approved: 1 },
  { date: new Date('2019-06-15'), key: reportKey, approved: 1, noFunds: 1 },
  { date: new Date('2019-06-10'), key: reportKey, approved: 1, pending: 1 },
  { date: new Date('2019-06-05'), key: reportKey, approved: 1, rejected: 1 },

  { date: new Date('2017-06-25'), key: reportKey, approved: 1 },
  { date: new Date('2017-06-15'), key: reportKey, approved: 1, noFunds: 1 },
  { date: new Date('2017-06-10'), key: reportKey, approved: 1, pending: 1 },
  { date: new Date('2017-06-05'), key: reportKey, approved: 1, rejected: 1 },

  { date: new Date('2015-06-25'), key: reportKey, approved: 1 },
  { date: new Date('2015-06-15'), key: reportKey, approved: 1, noFunds: 1 },
  { date: new Date('2015-06-10'), key: reportKey, approved: 1, pending: 1 },
  { date: new Date('2015-06-05'), key: reportKey, approved: 1, rejected: 1 },

  { date: new Date('2012-06-25'), key: reportKey, approved: 1 },
  { date: new Date('2012-06-15'), key: reportKey, approved: 1, noFunds: 1 },
  { date: new Date('2012-06-10'), key: reportKey, approved: 1, pending: 1 },
  { date: new Date('2012-06-05'), key: reportKey, approved: 1, rejected: 1 },
];

export const reports = [
  {
    id: 'oneYear',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2021-06-15T00:00:00.000Z'),
    totals: { approved: 4, noFunds: 1, pending: 1, rejected: 1 },
  },
  {
    id: 'threeYears',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2019-06-15T00:00:00.000Z'),
    totals: { approved: 8, noFunds: 2, pending: 2, rejected: 2 },
  },
  {
    id: 'fiveYears',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2017-06-15T00:00:00.000Z'),
    totals: { approved: 12, noFunds: 3, pending: 3, rejected: 3 },
  },
  {
    id: 'sevenYears',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2015-06-15T00:00:00.000Z'),
    totals: { approved: 16, noFunds: 4, pending: 4, rejected: 4 },
  },
  {
    id: 'tenYears',
    end: new Date('2022-06-15T00:00:00.000Z'),
    start: new Date('2012-06-15T00:00:00.000Z'),
    totals: { approved: 20, noFunds: 5, pending: 5, rejected: 5 },
  },
];
