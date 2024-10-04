import mdb from '../src/mdb';
import { withDb } from './helpers';
import * as P from '../src/applications';
import * as fixtures from './fixtures';

withDb(() => {
  describe('appV6R2', () => {
    test('Bulk Upsert', async () => {
      const docs0 = fixtures.eventsBulkUpsert[0];
      const idDocs0 = P.appV6R2.buildId(docs0[0].key, docs0[0].date);

      await P.appV6R2.bulkUpsert(docs0);

      const doc0V6R2 = await mdb.collections.appV6R2.findOne({ _id: idDocs0 });

      expect(doc0V6R2?.items).toEqual({ '0625': { a: 2, n: 2 } });

      const docs1 = fixtures.eventsBulkUpsert[1];
      const idDocs1 = P.appV6R2.buildId(docs1[0].key, docs1[0].date);

      await P.appV6R2.bulkUpsert(docs1);

      const doc1V6R2 = await mdb.collections.appV6R2.findOne({ _id: idDocs1 });

      expect(doc1V6R2?.report).toEqual({ a: 4, n: 4, p: 3, r: 1 });
      expect(doc1V6R2?.items).toEqual({
        '0615': { a: 2, n: 2, p: 3, r: 1 },
        '0625': { a: 2, n: 2 },
      });

      const docs2 = fixtures.eventsBulkUpsert[2];
      const idDocs2 = P.appV6R2.buildId(docs2[0].key, docs2[0].date);

      await P.appV6R2.bulkUpsert(docs2);

      const doc2V6R2 = await mdb.collections.appV6R2.findOne({ _id: idDocs2 });

      expect(doc2V6R2?.report).toEqual({ a: 6, n: 6, p: 6, r: 2 });
      expect(doc2V6R2?.items).toEqual({
        '0625': { a: 2, n: 2 },
        '0615': { a: 2, n: 2, p: 3, r: 1 },
        '0515': { a: 2, n: 2, p: 3, r: 1 },
      });
    });

    test('Get Report', async () => {
      const date = fixtures.reportDate;
      const docs = fixtures.eventsGetReports;
      const key = fixtures.reportKey;

      await P.appV6R2.bulkUpsert(docs);

      const reports = await P.appV6R2.getReports({ date, key });

      expect(reports).toEqual(fixtures.reports);
    });
  });
});
