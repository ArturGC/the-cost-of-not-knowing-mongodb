import { Db, ObjectId } from 'mongodb';

import MDB from '../src/mdb';

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
    await MDB.connect(
      { dbName: `api-test-${new ObjectId()}` },
      { appName: 'API Server Test', ignoreUndefined: true }
    );
  });

  beforeEach(async () => {
    await cleanAllCollections(MDB.db);
  });

  afterAll(async () => {
    await MDB.db.dropDatabase();
    await MDB.close();
  });

  test();
}
