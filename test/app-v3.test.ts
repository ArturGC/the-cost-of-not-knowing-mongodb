import mdb from '../src/mdb';
import { withDb } from './helpers';
import * as P from '../src/persistence';
import * as fixtures from './fixtures';

withDb(() => {
  describe('appV3', () => {
    test('Bulk Upsert', async () => {
      const docs0 = fixtures.eventsBulkUpsert[0];
      const idDocs0 = P.appV3.buildId(docs0[0].key, docs0[0].date);

      await P.appV3.bulkUpsert(docs0);

      const doc0V3 = await mdb.collections.appV3.findOne({ _id: idDocs0 });

      expect(doc0V3?.approved).toBe(2);
      expect(doc0V3?.noFunds).toBe(2);
      expect(doc0V3?.pending).toBeUndefined();
      expect(doc0V3?.rejected).toBeUndefined();

      const docs1 = fixtures.eventsBulkUpsert[1];
      const idDocs1 = P.appV3.buildId(docs1[0].key, docs1[0].date);

      await P.appV3.bulkUpsert(docs1);

      const doc1V3 = await mdb.collections.appV3.findOne({ _id: idDocs1 });

      expect(doc1V3?.approved).toBe(2);
      expect(doc1V3?.noFunds).toBe(2);
      expect(doc1V3?.pending).toBe(3);
      expect(doc1V3?.rejected).toBe(1);

      const docs2 = fixtures.eventsBulkUpsert[2];
      const idDocs2 = P.appV3.buildId(docs2[0].key, docs2[0].date);

      await P.appV3.bulkUpsert(docs2);

      const doc2V3 = await mdb.collections.appV3.findOne({ _id: idDocs2 });

      expect(doc2V3?.approved).toBe(2);
      expect(doc2V3?.noFunds).toBe(2);
      expect(doc2V3?.pending).toBe(3);
      expect(doc2V3?.rejected).toBe(1);
    });

    test('Get Report', async () => {
      const date = fixtures.reportDate;
      const docs = fixtures.eventsGetReports;
      const key = fixtures.reportKey;

      await P.appV3.bulkUpsert(docs);

      const reports = await P.appV3.getReports({ date, key });

      expect(reports).toEqual(fixtures.reports);
    });
  });
});
