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
  maxDuration: 30 * oneMinuteInMs,
} as const;

const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getSleepFactor = (dateStart: Date): number => {
  const msPassed = new Date().getTime() - dateStart.getTime();
  const percentagePassed = msPassed / production.maxDuration;

  if (percentagePassed < 0.2) return 1;
  else if (percentagePassed < 0.4) return 2;
  else if (percentagePassed < 0.6) return 3;
  else if (percentagePassed < 0.8) return 4;
  else return 5;
};
const shouldBreak = (dateStart: Date): boolean => {
  const msPassed = new Date().getTime() - dateStart.getTime();

  return msPassed > production.maxDuration;
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
      bulkUpsert: async (ms: number, dateStart: Date) =>
        sleep(10000 / getSleepFactor(dateStart) - ms),
      getReports: async (ms: number, dateStart: Date) =>
        sleep(200 / getSleepFactor(dateStart) - ms),
    },
  },
  sleep,
  workersTotal,
};
