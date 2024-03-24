const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

export const getReportDates = (
  date: Date
): Array<{ end: Date; start: Date }> => {
  return [
    { end: date, start: new Date(date.getTime() - oneYearInMs) },
    { end: date, start: new Date(date.getTime() - 2.5 * oneYearInMs) },
    { end: date, start: new Date(date.getTime() - 5 * oneYearInMs) },
    { end: date, start: new Date(date.getTime() - 7.5 * oneYearInMs) },
    { end: date, start: new Date(date.getTime() - 10 * oneYearInMs) },
  ];
};
