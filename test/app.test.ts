import request from 'supertest';

import mdb from '../server/mdb';
import { withDb } from './helpers';
import { generateDocDefault } from './fixtures';

import * as T from '../server/types';
import app from '../server/app';
import { endPoint as postDocsUrl } from '../server/controllers/post-docs';
import { endPoint as getReportsUrl } from '../server/controllers/get-reports';

withDb(() => {
  const versions: T.Version[] = [
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
      test('Post Docs', async () => {
        const countBefore = await mdb.collections[version].countDocuments({});

        expect(countBefore).toBe(0);

        const docs = Array.from({ length: 5 }).map(generateDocDefault);
        const url = postDocsUrl.replace(':version', version);
        const response = await request(app).post(url).send(docs);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ ok: true });

        const countAfter = await mdb.collections[version].countDocuments({});

        expect(countAfter).toBe(docs.length);
      });

      test('Get Report', async () => {
        await buildReportScenery(postDocsUrl.replace(':version', version));

        const url = getReportsUrl.replace(':version', version);
        const date = new Date('2022-06-15').toISOString();
        const response = await request(app).get(url).query({ date, key: '01' });

        expect(response.body).toEqual([
          {
            id: 'oneYear',
            end: '2022-06-15T00:00:00.000Z',
            start: '2021-06-15T00:00:00.000Z',
            report: { approved: 2, noFunds: 1, pending: 0, rejected: 0 },
          },
          {
            id: 'threeYears',
            end: '2022-06-15T00:00:00.000Z',
            start: '2019-06-16T00:00:00.000Z',
            report: { approved: 6, noFunds: 2, pending: 1, rejected: 1 },
          },
          {
            id: 'fiveYears',
            end: '2022-06-15T00:00:00.000Z',
            start: '2017-06-16T00:00:00.000Z',
            report: { approved: 10, noFunds: 3, pending: 2, rejected: 2 },
          },
          {
            id: 'sevenYears',
            end: '2022-06-15T00:00:00.000Z',
            start: '2015-06-17T00:00:00.000Z',
            report: { approved: 14, noFunds: 4, pending: 3, rejected: 3 },
          },
          {
            id: 'tenYears',
            end: '2022-06-15T00:00:00.000Z',
            start: '2012-06-17T00:00:00.000Z',
            report: { approved: 18, noFunds: 5, pending: 4, rejected: 4 },
          },
        ]);
      });
    });
  }
});

async function buildReportScenery(url: string) {
  const docs = [
    { date: new Date('2021-06-25'), key: '01', approved: 1 },
    { date: new Date('2021-06-20'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2021-06-10'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2021-06-05'), key: '01', approved: 1, rejected: 1 },

    { date: new Date('2019-06-25'), key: '01', approved: 1 },
    { date: new Date('2019-06-20'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2019-06-10'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2019-06-05'), key: '01', approved: 1, rejected: 1 },

    { date: new Date('2017-06-25'), key: '01', approved: 1 },
    { date: new Date('2017-06-20'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2017-06-10'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2017-06-05'), key: '01', approved: 1, rejected: 1 },

    { date: new Date('2015-06-25'), key: '01', approved: 1 },
    { date: new Date('2015-06-20'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2015-06-10'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2015-06-05'), key: '01', approved: 1, rejected: 1 },

    { date: new Date('2012-06-25'), key: '01', approved: 1 },
    { date: new Date('2012-06-20'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2012-06-10'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2012-06-05'), key: '01', approved: 1, rejected: 1 },
  ];

  await request(app).post(url).send(docs);
}
