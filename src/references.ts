const OneYearInMs = 365 * 24 * 60 * 60 * 1000;
const workersPerCluster = 4;
const clustersBatch = 5;

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
  production: {
    ...production,
    sleep: {
      bulkUpsert: async (time: number) => sleep(2500 - time),
      getReports: async (time: number) => sleep(50 - time),
    },
  },
  clustersBatch,
  workersPerCluster,
  workersTotal: clustersBatch * workersPerCluster,
};
