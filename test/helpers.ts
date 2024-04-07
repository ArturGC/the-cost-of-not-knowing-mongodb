import { Db } from 'mongodb';

import mdb from '../src/mdb';

export async function cleanAllCollections(db: Db) {
  const collections = await db.collections();

  return Promise.all(collections.map((c) => c.deleteMany({}).catch((e) => e)));
}

export async function dropAllCollections(db: Db) {
  const collections = await db.collections();

  return Promise.all(collections.map(async (c) => c.drop().catch((e) => e)));
}

export function withDb(test: () => void): void {
  beforeAll(async () => {
    await mdb.checkCollections();
  });

  beforeEach(async () => {
    await cleanAllCollections(mdb.dbApp);
    await cleanAllCollections(mdb.dbBase);
  });

  afterAll(async () => {
    await mdb.close();
  });

  test();
}
