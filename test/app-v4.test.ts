import mdb from '../src/mdb';
import { withDb } from './helpers';
import * as P from '../src/persistence';
import * as fixtures from './fixtures';

withDb(() => {
  describe('appV4', () => {
    test('Bulk Upsert', async () => {
      const docs0 = fixtures.eventsBulkUpsert[0];
      const idDocs0 = P.appV4.buildId(docs0[0].key, docs0[0].date);

      await P.appV4.bulkUpsert(docs0);

      const doc0V4 = await mdb.collections.appV4.findOne({ _id: idDocs0 });

      expect(doc0V4?.a).toBe(2);
      expect(doc0V4?.n).toBe(2);
      expect(doc0V4?.p).toBeUndefined();
      expect(doc0V4?.r).toBeUndefined();

      const docs1 = fixtures.eventsBulkUpsert[1];
      const idDocs1 = P.appV4.buildId(docs1[0].key, docs1[0].date);

      await P.appV4.bulkUpsert(docs1);

      const doc1V4 = await mdb.collections.appV4.findOne({ _id: idDocs1 });

      expect(doc1V4?.a).toBe(2);
      expect(doc1V4?.n).toBe(2);
      expect(doc1V4?.p).toBe(3);
      expect(doc1V4?.r).toBe(1);

      const docs2 = fixtures.eventsBulkUpsert[2];
      const idDocs2 = P.appV4.buildId(docs2[0].key, docs2[0].date);

      await P.appV4.bulkUpsert(docs2);

      const doc2V4 = await mdb.collections.appV4.findOne({ _id: idDocs2 });

      expect(doc2V4?.a).toBe(2);
      expect(doc2V4?.n).toBe(2);
      expect(doc2V4?.p).toBe(3);
      expect(doc2V4?.r).toBe(1);
    });

    test('Get Report', async () => {
      const date = fixtures.reportDate;
      const docs = fixtures.eventsGetReports;
      const key = fixtures.reportKey;

      await P.appV4.bulkUpsert(docs);

      const reports = await P.appV4.getReports({ date, key });

      expect(reports).toEqual(fixtures.reports);
    });
  });
});
