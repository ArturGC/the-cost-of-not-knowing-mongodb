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

export const getYYYY = (date: Date): string => {
  return date.toISOString().split('-')[0];
};

export const getMM = (date: Date): string => {
  return date.toISOString().split('-')[1];
};

export const getDD = (date: Date): string => {
  return date.toISOString().split('T')[0].split('-')[2];
};

export const getQQ = (date: Date): string => {
  const month = Number(getMM(date));

  if (month >= 1 && month <= 3) return '01';
  else if (month >= 4 && month <= 6) return '02';
  else if (month >= 7 && month <= 9) return '03';
  else return '04';
};

export const getMMDD = (date: Date): string => {
  return `${getMM(date)}${getDD(date)}`;
};

export const getSS = (date: Date): string => {
  const month = Number(getMM(date));

  return month <= 6 ? '01' : '02';
};
