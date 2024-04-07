import mdb from '../src/mdb';
import { withDb } from './helpers';
import * as T from '../src/types';
import * as P from '../src/persistence';
import generator from '../src/generator';

withDb(() => {
  const versions: T.AppVersion[] = [
    'appV0',
    'appV1',
    'appV2',
    'appV3',
    'appV4',
    'appV5',
    'appV6',
    'appV7',
    'appV8',
    'appV9',
    'appV10',
    'appV11',
  ] as const;

  for (const version of versions) {
    describe(`${version}`, () => {
      test('Bulk Upsert', async () => {
        const docs = Array.from({ length: 5 }).map(() =>
          generator.getTransaction()
        );
        const countBefore = await mdb.collections[version].countDocuments({});
        expect(countBefore).toBe(0);

        await P[version].bulkUpsert(docs);

        const countAfter = await mdb.collections[version].countDocuments({});
        expect(countAfter).toBe(docs.length);
      });

      test('Get Report', async () => {
        await buildReportScenery(version);

        const reports = await P[version].getReports({
          date: new Date('2022-06-15'),
          key: 1,
        });

        expect(reports).toEqual([
          {
            id: 'oneYear',
            end: new Date('2022-06-15T00:00:00.000Z'),
            start: new Date('2021-06-15T00:00:00.000Z'),
            report: { approved: 2, noFunds: 1, pending: 0, rejected: 0 },
          },
          {
            id: 'threeYears',
            end: new Date('2022-06-15T00:00:00.000Z'),
            start: new Date('2019-06-15T00:00:00.000Z'),
            report: { approved: 6, noFunds: 2, pending: 1, rejected: 1 },
          },
          {
            id: 'fiveYears',
            end: new Date('2022-06-15T00:00:00.000Z'),
            start: new Date('2017-06-15T00:00:00.000Z'),
            report: { approved: 10, noFunds: 3, pending: 2, rejected: 2 },
          },
          {
            id: 'sevenYears',
            end: new Date('2022-06-15T00:00:00.000Z'),
            start: new Date('2015-06-15T00:00:00.000Z'),
            report: { approved: 14, noFunds: 4, pending: 3, rejected: 3 },
          },
          {
            id: 'tenYears',
            end: new Date('2022-06-15T00:00:00.000Z'),
            start: new Date('2012-06-15T00:00:00.000Z'),
            report: { approved: 18, noFunds: 5, pending: 4, rejected: 4 },
          },
        ]);
      });
    });
  }
});

async function buildReportScenery(version: T.AppVersion) {
  const docs = [
    { date: new Date('2021-06-25'), key: 1, a: 1 },
    { date: new Date('2021-06-15'), key: 1, a: 1, n: 1 },
    { date: new Date('2021-06-10'), key: 1, a: 1, p: 1 },
    { date: new Date('2021-06-05'), key: 1, a: 1, r: 1 },

    { date: new Date('2019-06-25'), key: 1, a: 1 },
    { date: new Date('2019-06-15'), key: 1, a: 1, n: 1 },
    { date: new Date('2019-06-10'), key: 1, a: 1, p: 1 },
    { date: new Date('2019-06-05'), key: 1, a: 1, r: 1 },

    { date: new Date('2017-06-25'), key: 1, a: 1 },
    { date: new Date('2017-06-15'), key: 1, a: 1, n: 1 },
    { date: new Date('2017-06-10'), key: 1, a: 1, p: 1 },
    { date: new Date('2017-06-05'), key: 1, a: 1, r: 1 },

    { date: new Date('2015-06-25'), key: 1, a: 1 },
    { date: new Date('2015-06-15'), key: 1, a: 1, n: 1 },
    { date: new Date('2015-06-10'), key: 1, a: 1, p: 1 },
    { date: new Date('2015-06-05'), key: 1, a: 1, r: 1 },

    { date: new Date('2012-06-25'), key: 1, a: 1 },
    { date: new Date('2012-06-15'), key: 1, a: 1, n: 1 },
    { date: new Date('2012-06-10'), key: 1, a: 1, p: 1 },
    { date: new Date('2012-06-05'), key: 1, a: 1, r: 1 },
  ];

  await P[version].bulkUpsert(docs);
}
