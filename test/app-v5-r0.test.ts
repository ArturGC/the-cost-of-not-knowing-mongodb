import mdb from '../src/mdb';
import { withDb } from './helpers';
import * as P from '../src/applications';
import * as fixtures from './fixtures';

withDb(() => {
  describe('appV5R0', () => {
    test('Bulk Upsert', async () => {
      const docs0 = fixtures.eventsBulkUpsert[0];
      const idDocs0 = P.appV5R0.buildId(docs0[0].key, docs0[0].date);

      await P.appV5R0.bulkUpsert(docs0);

      const doc0V5R0 = await mdb.collections.appV5R0.findOne({ _id: idDocs0 });

      expect(doc0V5R0?.items).toEqual([
        { date: new Date('2022-06-25'), a: 1 },
        { date: new Date('2022-06-25'), a: 1 },
        { date: new Date('2022-06-25'), n: 1 },
        { date: new Date('2022-06-25'), n: 1 },
      ]);

      const docs1 = fixtures.eventsBulkUpsert[1];
      const idDocs1 = P.appV5R0.buildId(docs1[0].key, docs1[0].date);

      await P.appV5R0.bulkUpsert(docs1);

      const doc1V5R0 = await mdb.collections.appV5R0.findOne({ _id: idDocs1 });

      expect(doc1V5R0?.items).toEqual([
        { date: new Date('2022-06-25'), a: 1 },
        { date: new Date('2022-06-25'), a: 1 },
        { date: new Date('2022-06-25'), n: 1 },
        { date: new Date('2022-06-25'), n: 1 },
        { date: new Date('2022-06-15'), a: 1, n: 1 },
        { date: new Date('2022-06-15'), a: 1, p: 1 },
        { date: new Date('2022-06-15'), n: 1, p: 1 },
        { date: new Date('2022-06-15'), p: 1, r: 1 },
      ]);

      const docs2 = fixtures.eventsBulkUpsert[2];
      const idDocs2 = P.appV5R0.buildId(docs2[0].key, docs2[0].date);

      await P.appV5R0.bulkUpsert(docs2);

      const doc2V5R0 = await mdb.collections.appV5R0.findOne({ _id: idDocs2 });

      expect(doc2V5R0?.items).toEqual([
        { date: new Date('2022-05-15'), a: 1, n: 1 },
        { date: new Date('2022-05-15'), a: 1, p: 1 },
        { date: new Date('2022-05-15'), n: 1, p: 1 },
        { date: new Date('2022-05-15'), p: 1, r: 1 },
      ]);
    });

    test('Get Report', async () => {
      const date = fixtures.reportDate;
      const docs = fixtures.eventsGetReports;
      const key = fixtures.reportKey;

      await P.appV5R0.bulkUpsert(docs);

      const reports = await P.appV5R0.getReports({ date, key });

      expect(reports).toEqual(fixtures.reports);
    });
  });
});
