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
  maxDuration: 60 * oneMinuteInMs,
} as const;

const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getSleepFactor = (dateStart: Date): number => {
  const msPassed = new Date().getTime() - dateStart.getTime();
  const percentagePassed = msPassed / production.maxDuration;

  if (percentagePassed < 0.17) return 1;
  else if (percentagePassed < 0.33) return 2;
  else if (percentagePassed < 0.5) return 3;
  else if (percentagePassed < 0.67) return 4;
  else if (percentagePassed < 0.84) return 5;
  else return 6;
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
      bulkUpsert: async (ms: number, dateStart: Date) => sleep(10000 / getSleepFactor(dateStart) - ms),
      getReports: async (ms: number, dateStart: Date) => sleep(200 / getSleepFactor(dateStart) - ms),
    },
  },
  sleep,
  workersTotal,
};
