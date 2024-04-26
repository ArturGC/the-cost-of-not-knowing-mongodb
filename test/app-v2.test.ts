import mdb from '../src/mdb';
import { withDb } from './helpers';
import * as fixtures from './fixtures';
import * as P from '../src/persistence';

withDb(() => {
  describe('appV2', () => {
    test('Bulk Upsert', async () => {
      const docs0 = fixtures.eventsBulkUpsert[0];
      const idDocs0 = {
        key: docs0[0].key,
        date: docs0[0].date,
      };

      await P.appV2.bulkUpsert(docs0);

      const doc0V2 = await mdb.collections.appV2.findOne(idDocs0);

      expect(doc0V2?.approved).toBe(2);
      expect(doc0V2?.noFunds).toBe(2);
      expect(doc0V2?.pending).toBeUndefined();
      expect(doc0V2?.rejected).toBeUndefined();

      const docs1 = fixtures.eventsBulkUpsert[1];
      const idDocs1 = {
        key: docs1[0].key,
        date: docs1[0].date,
      };

      await P.appV2.bulkUpsert(docs1);

      const doc1V2 = await mdb.collections.appV2.findOne(idDocs1);

      expect(doc1V2?.approved).toBe(2);
      expect(doc1V2?.noFunds).toBe(2);
      expect(doc1V2?.pending).toBe(3);
      expect(doc1V2?.rejected).toBe(1);

      const docs2 = fixtures.eventsBulkUpsert[2];
      const idDocs2 = {
        key: docs2[0].key,
        date: docs2[0].date,
      };

      await P.appV2.bulkUpsert(docs2);

      const doc2V2 = await mdb.collections.appV2.findOne(idDocs2);

      expect(doc2V2?.approved).toBe(2);
      expect(doc2V2?.noFunds).toBe(2);
      expect(doc2V2?.pending).toBe(3);
      expect(doc2V2?.rejected).toBe(1);
    });

    test('Get Report', async () => {
      const date = fixtures.reportDate;
      const docs = fixtures.eventsGetReports;
      const key = fixtures.reportKey;

      await P.appV2.bulkUpsert(docs);

      const reports = await P.appV2.getReports({ date, key });

      expect(reports).toEqual(fixtures.reports);
    });
  });
});
