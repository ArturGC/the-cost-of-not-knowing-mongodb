import { setTimeout } from 'k6/experimental/timers';

// References
const OneYearInMs = 365 * 24 * 60 * 60 * 1000;

// Application/Load Data
const DocsQuantity = 300 * Math.pow(10, 6);
const MaxConcurrentInsertions = 7500;
const VusQuantity = 20;
const UserTransactionsPerMonth = 5;
const DateStart = new Date('2010-01-01');
const LoadDateSpamInYeas = 10;
const LoadDateSpamInMonths = 12 * LoadDateSpamInYeas;
const LoadDateSpamInMs = LoadDateSpamInYeas * OneYearInMs;
const DateEnd = new Date(DateStart.getTime() + LoadDateSpamInMs);

// Load Parameters
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
    LoadDateSpamInYeas,
    UsersPerVu,
    VusQuantity,
  },
};

export const production = {
  duration: '30m',
  getReport: {
    VusQuantity: VusQuantity,
    sleep: async (duration) => sleep(100 - duration),
  },
  postDocs: {
    BatchSize,
    DateEnd,
    UsersPerVu,
    VusQuantity,
    sleep: async (duration) => sleep(2500 - duration),
  },
};

export const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
