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
        const date = new Date('2022-01-01').toISOString();
        const response = await request(app).get(url).query({ date, key: '01' });

        expect(response.body).toEqual([
          { approved: 4, noFunds: 1, pending: 1, rejected: 1 },
          { approved: 8, noFunds: 2, pending: 2, rejected: 2 },
          { approved: 12, noFunds: 3, pending: 3, rejected: 3 },
          { approved: 16, noFunds: 4, pending: 4, rejected: 4 },
          { approved: 20, noFunds: 5, pending: 5, rejected: 5 },
        ]);
      });
    });
  }
});

async function buildReportScenery(url: string) {
  const docs = [
    { date: new Date('2013-02-01'), key: '01', approved: 1, rejected: 1 },
    { date: new Date('2013-02-01'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2013-02-01'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2013-02-01'), key: '01', approved: 1 },

    { date: new Date('2015-02-01'), key: '01', approved: 1, rejected: 1 },
    { date: new Date('2015-02-01'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2015-02-01'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2015-02-01'), key: '01', approved: 1 },

    { date: new Date('2018-02-01'), key: '01', approved: 1, rejected: 1 },
    { date: new Date('2018-02-01'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2018-02-01'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2018-02-01'), key: '01', approved: 1 },

    { date: new Date('2020-02-01'), key: '01', approved: 1, rejected: 1 },
    { date: new Date('2020-02-01'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2020-02-01'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2020-02-01'), key: '01', approved: 1 },

    { date: new Date('2021-02-01'), key: '01', approved: 1, rejected: 1 },
    { date: new Date('2021-02-01'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2021-02-01'), key: '01', approved: 1, noFunds: 1 },
    { date: new Date('2021-02-01'), key: '01', approved: 1 },
  ];

  await request(app).post(url).send(docs);
}
