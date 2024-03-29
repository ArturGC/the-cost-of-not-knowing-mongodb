/* eslint-disable sort-keys */
import type * as T from './types';

export const getReportsDates = (
  date: Date
): Array<{ id: T.ReportYear; end: Date; start: Date }> => {
  return [
    {
      id: 'oneYear',
      end: date,
      start: new Date(
        new Date(date.getTime()).setUTCFullYear(date.getUTCFullYear() - 1)
      ),
    },
    {
      id: 'threeYears',
      end: date,
      start: new Date(
        new Date(date.getTime()).setUTCFullYear(date.getUTCFullYear() - 3)
      ),
    },
    {
      id: 'fiveYears',
      end: date,
      start: new Date(
        new Date(date.getTime()).setUTCFullYear(date.getUTCFullYear() - 5)
      ),
    },
    {
      id: 'sevenYears',
      end: date,
      start: new Date(
        new Date(date.getTime()).setUTCFullYear(date.getUTCFullYear() - 7)
      ),
    },
    {
      id: 'tenYears',
      end: date,
      start: new Date(
        new Date(date.getTime()).setUTCFullYear(date.getUTCFullYear() - 10)
      ),
    },
  ];
};
