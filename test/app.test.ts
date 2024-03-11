import request from 'supertest';

import mdb from '../src/mdb';
import { withDb } from './helpers';
import { generateDocDefault } from './fixtures';

import * as T from '../src/types';
import app from '../src/app';
import { endPoint as postDocsUrl } from '../src/controllers/post-docs';
import { endPoint as getReportsUrl } from '../src/controllers/get-reports';

withDb(() => {
  const versions: T.Version[] = [
    // 'appV0',
    // 'appV1',
    // 'appV2',
    // 'appV3',
    // 'appV4',
    'appV5',
    'appV6',
    // 'appV7',
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
        const dateEnd = new Date('2021-02-20').toISOString();
        const dateStart = new Date('2019-01-01').toISOString();
        const response = await request(app)
          .get(url)
          .query({ dateEnd, dateStart, key: '01' });

        expect(response.body).toEqual({
          approved: 17,
          noFunds: 4,
          pending: 3,
          rejected: 6,
        });
      });
    });
  }
});

async function buildReportScenery(url: string) {
  const docs = [
    { date: new Date('2018-02-01'), key: '01', approved: 3 },

    { date: new Date('2019-02-01'), key: '01', approved: 5, pending: 3 },
    { date: new Date('2019-02-10'), key: '01', approved: 3, noFunds: 1 },
    { date: new Date('2019-02-15'), key: '01', rejected: 3 },
    { date: new Date('2020-02-01'), key: '01', approved: 7, rejected: 3 },
    { date: new Date('2021-02-01'), key: '01', approved: 1, noFunds: 3 },
    { date: new Date('2021-02-15'), key: '01', approved: 1 },

    { date: new Date('2021-02-25'), key: '01', approved: 1, pending: 1 },
    { date: new Date('2022-02-01'), key: '01', approved: 1, rejected: 5 },
  ];

  await request(app).post(url).send(docs);
}
