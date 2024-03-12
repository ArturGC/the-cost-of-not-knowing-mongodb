// References
const G = Math.pow(10, 9);
const oneYear = 365 * 24 * 60 * 60 * 1000;

// EC2 Configuration
const cpu = 2;
const ram = 4 * G;
const workingSetSize = 2 * ram;

// Application/Load Data
const maxInsertion = 1000;
const v0DocSize = 117;
const vuQuantity = 10;
const userTransactionsPerMonth = 5;
const dateStart = new Date('2015-01-01');
const loadDateSpamInYeas = 5;
const loadDateSpamInMonths = 12 * loadDateSpamInYeas;
const loadDateSpamInMs = loadDateSpamInYeas * oneYear;

// Test Parameters
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
};
