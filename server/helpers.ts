/* eslint-disable sort-keys */
import type * as T from './types';

const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

export const getReportsDates = (
  date: Date
): Array<{ id: T.ReportYear; end: Date; start: Date }> => {
  return [
    {
      id: 'oneYear',
      end: date,
      start: new Date(date.getTime() - oneYearInMs),
    },
    {
      id: 'threeYears',
      end: date,
      start: new Date(date.getTime() - 3 * oneYearInMs),
    },
    {
      id: 'fiveYears',
      end: date,
      start: new Date(date.getTime() - 5 * oneYearInMs),
    },
    {
      id: 'sevenYears',
      end: date,
      start: new Date(date.getTime() - 7 * oneYearInMs),
    },
    {
      id: 'tenYears',
      end: date,
      start: new Date(date.getTime() - 10 * oneYearInMs),
    },
  ];
};
