import request from 'supertest';

import mdb from '../src/mdb';
import * as T from '../src/types';
import { withDb } from './helpers';
import { generateDocDefault } from './fixtures';

import app from '../src/app';
import { endPoint as postDocsUrl } from '../src/controllers/app-v0/post-docs';
import { endPoint as getReportsUrl } from '../src/controllers/app-v0/get-reports';

withDb(() => {
  describe('App V0', () => {
    test('Post Docs', async () => {
      const countBefore = await mdb.collections.appV0.countDocuments({});

      expect(countBefore).toBe(0);

      const docs = Array.from({ length: 5 }).map(generateDocDefault);
      const response = await request(app).post(postDocsUrl).send(docs);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ ok: true });

      const countAfter = await mdb.collections.appV0.countDocuments({});
      expect(countAfter).toBe(docs.length);
    });

    test('Get Report', async () => {
      await buildReportScenery();

      const response = await request(app)
        .get(getReportsUrl)
        .query({
          dateEnd: new Date('2022-01-01').toISOString(),
          dateStart: new Date('2019-01-01').toISOString(),
          key: '1',
        });

      expect(response.body).toEqual({
        _id: '1',
        approved: 13,
        noFunds: 3,
        pending: 3,
        rejected: 3,
      });
    });
  });
});

async function buildReportScenery() {
  await mdb.collections.appV0.insertMany([
    {
      _id: { date: new Date('2018-02-01'), key: '1' },
      approved: 3,
    },
    {
      _id: { date: new Date('2019-02-01'), key: '1' },
      approved: 5,
      pending: 3,
    },
    {
      _id: { date: new Date('2020-02-01'), key: '1' },
      approved: 7,
      rejected: 3,
    },
    {
      _id: { date: new Date('2021-02-01'), key: '1' },
      approved: 1,
      noFunds: 3,
    },
    {
      _id: { date: new Date('2022-02-01'), key: '1' },
      approved: 1,
      rejected: 5,
    },
  ]);
}
