const oneMinuteInMs = 60 * 1000;
const OneYearInMs = 365 * 24 * 60 * 60 * 1000;
const workersTotal = 20;

const base = {
  batchSize: 500,
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
} as const;

const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const dateStart = new Date();
const getSleepFactor = (): number => {
  const msPassed = new Date().getTime() - dateStart.getTime();

  if (msPassed < 5 * oneMinuteInMs) return 1;
  else if (msPassed < 10 * oneMinuteInMs) return 2;
  else if (msPassed < 15 * oneMinuteInMs) return 3;
  else if (msPassed < 20 * oneMinuteInMs) return 4;
  else return 5;
};
const shouldBreak = (): boolean => {
  const msPassed = new Date().getTime() - dateStart.getTime();

  return msPassed > 30 * oneMinuteInMs;
};

export default {
  base: {
    ...base,
    deltaTime: Math.ceil(OneYearInMs / base.transactionsPerYear),
    usersQuantity: Math.ceil(
      base.transactionsPerYear / base.userTransactionsPerYear
    ),
  },
  load: {
    ...load,
  },
  prod: {
    ...production,
    shouldBreak,
    sleep: {
      bulkUpsert: async (ms: number) => sleep(10000 / getSleepFactor() - ms),
      getReports: async (ms: number) => sleep(200 / getSleepFactor() - ms),
    },
  },
  dateStart,
  sleep,
  workersTotal,
};
