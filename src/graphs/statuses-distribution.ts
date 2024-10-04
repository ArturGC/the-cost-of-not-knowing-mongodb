import { type AnyBulkWriteOperation, MongoClient } from 'mongodb';

import { Generator } from '../generator';
import refs from '../references';

const main = async (): Promise<void> => {
  type Schema = { _id: string; count: number };

  const url = 'mongodb://127.0.0.1:27017/';
  const client = new MongoClient(url);
  const db = client.db('prod');
  const keysDistribution = db.collection<Schema>('keysDistribution');
  const generator = new Generator(refs.scenario.date);

  for (let i = 0; i <= 10_000; i += 1) {
    let operations: Array<AnyBulkWriteOperation<Schema>> = [];

    for (let j = 0; j <= 5_000; j += 1) {
      operations.push({
        updateOne: {
          filter: { _id: generator.getKey() },
          update: { $inc: { count: 1 } },
          upsert: true,
        },
      });
    }

    await keysDistribution.bulkWrite(operations, { ordered: false });

    operations = [];
  }

  await client.close();
};

main().catch(console.error);
