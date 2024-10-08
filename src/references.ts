const oneMinuteInMs = 60 * 1000;
const OneYearInMs = 365 * 24 * 60 * 60 * 1000;

// General
const general = {
  workers: 20,
  batchSize: 250,
  eventsPerYear: 50 * Math.pow(10, 6),
  eventsPerUserPerYear: 60,
};

// Scenario
const scenario = {
  date: {
    start: new Date('2010-01-01'),
    end: new Date('2020-01-01'),
  },
} as const;

// Load Test
const loadTest = {
  date: { start: new Date('2020-01-01'), end: new Date('2021-01-01') },
  duration: 200 * oneMinuteInMs,
} as const;

export default {
  general: {
    ...general,
    eventDeltaTime: Math.ceil((general.workers * OneYearInMs) / general.eventsPerYear),
    users: Math.ceil(general.eventsPerYear / general.eventsPerUserPerYear),
  },
  loadTest: {
    ...loadTest,
  },
  scenario: {
    ...scenario,
  },
} as const;
