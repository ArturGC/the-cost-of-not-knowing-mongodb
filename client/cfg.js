import { setTimeout } from 'k6/experimental/timers';

// References
const OneGigabyte = Math.pow(2, 30);
const OneYearInMs = 365 * 24 * 60 * 60 * 1000;

// EC2 Configuration
const AppV0GroupingFactor = 1.425;
const RAM = 4 * OneGigabyte;
const LoadDataSize = 5 * RAM * AppV0GroupingFactor;

// Application/Load Data
const MaxConcurrentInsertions = 5000;
const AppV0DocSize = 118;
const VusQuantity = 10;
const UserTransactionsPerMonth = 5;
const DateStart = new Date('2015-01-01');
const LoadDateSpamInYeas = 5;
const LoadDateSpamInMonths = 12 * LoadDateSpamInYeas;
const LoadDateSpamInMs = LoadDateSpamInYeas * OneYearInMs;
const DateEnd = new Date(DateStart.getTime() + LoadDateSpamInMs);

// Load Parameters
const DocsQuantity = Math.floor(LoadDataSize / AppV0DocSize);
const BatchSize = Math.floor(MaxConcurrentInsertions / VusQuantity);
const UsersQuantity = Math.floor(
  DocsQuantity / (LoadDateSpamInMonths * UserTransactionsPerMonth)
);
const UsersPerVu = Math.floor(UsersQuantity / VusQuantity);
const DeltaTime = Math.floor((VusQuantity * LoadDateSpamInMs) / DocsQuantity);
const Iterations = Math.floor(DocsQuantity / (VusQuantity * BatchSize));

export const references = {
  OneYearInMs,
};

export const load = {
  postDocs: {
    BatchSize,
    DateEnd,
    DateStart,
    DeltaTime,
    Iterations,
    UsersPerVu,
    VusQuantity,
  },
};

export const production = {
  duration: '20m',
  getReport: {
    VusQuantity,
    sleep: async (duration) => sleep(2000 - duration),
  },
  postDocs: {
    BatchSize,
    DateEnd,
    UsersPerVu,
    VusQuantity,
    sleep: async (duration) => sleep(5000 - duration),
  },
};

export const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
