const oneMinuteInMs = 60 * 1000;
const OneYearInMs = 365 * 24 * 60 * 60 * 1000;
const workersTotal = 10;

const base = {
  batchSize: 1000,
  transactionsPerYear: 50 * Math.pow(10, 6),
  userTransactionsPerYear: 60,
} as const;

const load = {
  dateStart: new Date('2010-01-01'),
  dateEnd: new Date('2020-01-01'),
} as const;

const production = {
  dateStart: new Date('2020-01-01'),
  dateEnd: new Date('2021-01-01'),
  maxDuration: 90 * oneMinuteInMs,
} as const;

const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getSleepFactorBulkWrite = (dateStart: Date): number => {
  const msPassed = new Date().getTime() - dateStart.getTime();
  const minutesPassed = msPassed / oneMinuteInMs;

  if (minutesPassed < 30) return 2;
  else if (minutesPassed < 60) return 3;
  else return 4;
};

const getSleepFactorGetReports = (dateStart: Date): number => {
  const msPassed = new Date().getTime() - dateStart.getTime();
  const minutesPassed = msPassed / oneMinuteInMs;
  const reminder = minutesPassed % 30;

  if (reminder < 7.5) return 2;
  else if (reminder < 15) return 4;
  else if (reminder < 22.5) return 6;
  else return 8;
};

const shouldBreak = (dateStart: Date): boolean => {
  const msPassed = new Date().getTime() - dateStart.getTime();

  return msPassed > production.maxDuration;
};

export default {
  base: {
    ...base,
    deltaTime: Math.ceil(OneYearInMs / base.transactionsPerYear),
    usersQuantity: Math.ceil(base.transactionsPerYear / base.userTransactionsPerYear),
  },
  load: {
    ...load,
  },
  prod: {
    ...production,
    shouldBreak,
    sleep: {
      bulkUpsert: async (ms: number, dateStart: Date) => sleep(10000 / getSleepFactorBulkWrite(dateStart) - ms),
      getReports: async (ms: number, dateStart: Date) => sleep(200 / getSleepFactorGetReports(dateStart) - ms),
    },
  },
  sleep,
  workersTotal,
};
