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

export const getYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '');
};

export const getQuarter = (date: Date): string => {
  const month = date.getMonth();
  if (month >= 0 && month <= 2) return '01';
  else if (month >= 3 && month <= 5) return '02';
  else if (month >= 6 && month <= 8) return '03';
  else return '04';
};

export const getSemester = (date: Date): string => {
  const month = date.getMonth();

  return month >= 0 && month <= 5 ? '01' : '02';
};

export const getYYYY = (date: Date): string => {
  return date.getFullYear().toString();
};

export const getMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '').slice(4);
};

export const buildFieldAccumulator = (
  field: string
): Record<string, unknown> => {
  return {
    $add: [
      `$$value.${field}`,
      { $cond: [`$$this.v.${field}`, `$$this.v.${field}`, 0] },
    ],
  };
};

export const buildKey = (key: number): string => {
  return key.toString().padStart(64, '0');
};
