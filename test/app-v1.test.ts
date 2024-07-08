import mdb from '../src/mdb';
import { withDb } from './helpers';
import * as fixtures from './fixtures';
import * as P from '../src/persistence';
import { buildKeyHex } from '../src/helpers';

withDb(() => {
  describe('appV1', () => {
    test('Bulk Upsert', async () => {
      const docs0 = fixtures.eventsBulkUpsert[0];
      const idDocs0 = {
        key: buildKeyHex(docs0[0].key),
        date: docs0[0].date,
      };

      await P.appV1.bulkUpsert(docs0);

      const doc0V1 = await mdb.collections.appV1.findOne({
        '_id.key': idDocs0.key,
        '_id.date': idDocs0.date,
      });

      expect(doc0V1?.approved).toBe(2);
      expect(doc0V1?.noFunds).toBe(2);
      expect(doc0V1?.pending).toBeUndefined();
      expect(doc0V1?.rejected).toBeUndefined();

      const docs1 = fixtures.eventsBulkUpsert[1];
      const idDocs1 = {
        key: buildKeyHex(docs1[0].key),
        date: docs1[0].date,
      };

      await P.appV1.bulkUpsert(docs1);

      const doc1V1 = await mdb.collections.appV1.findOne({
        '_id.key': idDocs1.key,
        '_id.date': idDocs1.date,
      });

      expect(doc1V1?.approved).toBe(2);
      expect(doc1V1?.noFunds).toBe(2);
      expect(doc1V1?.pending).toBe(3);
      expect(doc1V1?.rejected).toBe(1);

      const docs2 = fixtures.eventsBulkUpsert[2];
      const idDocs2 = {
        key: buildKeyHex(docs2[0].key),
        date: docs2[0].date,
      };

      await P.appV1.bulkUpsert(docs2);

      const doc2V1 = await mdb.collections.appV1.findOne({
        '_id.key': idDocs2.key,
        '_id.date': idDocs2.date,
      });

      expect(doc2V1?.approved).toBe(2);
      expect(doc2V1?.noFunds).toBe(2);
      expect(doc2V1?.pending).toBe(3);
      expect(doc2V1?.rejected).toBe(1);
    });

    test('Get Report', async () => {
      const date = fixtures.reportDate;
      const docs = fixtures.eventsGetReports;
      const key = fixtures.reportKey;

      await P.appV1.bulkUpsert(docs);

      const reports = await P.appV1.getReports({ date, key });

      expect(reports).toEqual(fixtures.reports);
    });
  });
});
