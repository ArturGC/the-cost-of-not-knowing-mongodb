// References
const G = Math.pow(2, 30);
const oneYear = 365 * 24 * 60 * 60 * 1000;

// EC2 Configuration
const groupingFactor = 1.42;
const ram = 4 * G;
const workingSetSize = 5 * ram * groupingFactor;

// Application/Load Data
const maxInsertion = 5000;
const v0DocSize = 118;
const vuQuantity = 10;
const userTransactionsPerMonth = 5;
const dateStart = new Date('2015-01-01');
const loadDateSpamInYeas = 5;
const loadDateSpamInMonths = 12 * loadDateSpamInYeas;
const loadDateSpamInMs = loadDateSpamInYeas * oneYear;

// Load Parameters
const docsQuantity = Math.floor(workingSetSize / v0DocSize);
const batchSize = Math.floor(maxInsertion / vuQuantity);
const usersQuantity = Math.floor(
  docsQuantity / (loadDateSpamInMonths * userTransactionsPerMonth)
);
const usersPerVu = Math.floor(usersQuantity / vuQuantity);
const deltaTime = Math.floor((vuQuantity * loadDateSpamInMs) / docsQuantity);
const iterations = Math.floor(docsQuantity / (vuQuantity * batchSize));

export default {
  deltaTime,
  dateStart,
  usersPerVu,
  vuQuantity,
  iterations,
  batchSize,
  oneYear,
};

export const load = {
  postDocs: {
    deltaTime,
    dateStart,
    usersPerVu,
    vuQuantity,
    iterations,
    batchSize,
    oneYear,
  },
};

// Production Parameters

export const production = {
  duration: '10m',
  getReport: {},
  postDocs: {
    batchSize: Math.floor(load.postDocs.batchSize / 2),
    vuQuantity: load.postDocs.vuQuantity,
    minIterationDuration: '1s',
  },
};
