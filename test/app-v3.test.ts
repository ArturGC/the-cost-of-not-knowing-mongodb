import mdb from '../src/mdb';
import { withDb } from './helpers';
import * as P from '../src/persistence';
import * as fixtures from './fixtures';

withDb(() => {
  describe('appV3', () => {
    test('Bulk Upsert', async () => {
      const docs0 = fixtures.eventsBulkUpsert[0];
      const idDocs0 = {
        key: P.appV3.buildKey(docs0[0].key),
        date: docs0[0].date,
      };

      await P.appV3.bulkUpsert(docs0);

      const doc0V3 = await mdb.collections.appV3.findOne(idDocs0);

      expect(doc0V3?.a).toBe(2);
      expect(doc0V3?.n).toBe(2);
      expect(doc0V3?.p).toBeUndefined();
      expect(doc0V3?.r).toBeUndefined();

      const docs1 = fixtures.eventsBulkUpsert[1];
      const idDocs1 = {
        key: P.appV3.buildKey(docs1[0].key),
        date: docs1[0].date,
      };

      await P.appV3.bulkUpsert(docs1);

      const doc1V3 = await mdb.collections.appV3.findOne(idDocs1);

      expect(doc1V3?.a).toBe(2);
      expect(doc1V3?.n).toBe(2);
      expect(doc1V3?.p).toBe(3);
      expect(doc1V3?.r).toBe(1);

      const docs2 = fixtures.eventsBulkUpsert[2];
      const idDocs2 = {
        key: P.appV3.buildKey(docs2[0].key),
        date: docs2[0].date,
      };

      await P.appV3.bulkUpsert(docs2);

      const doc2V3 = await mdb.collections.appV3.findOne(idDocs2);

      expect(doc2V3?.a).toBe(2);
      expect(doc2V3?.n).toBe(2);
      expect(doc2V3?.p).toBe(3);
      expect(doc2V3?.r).toBe(1);
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
