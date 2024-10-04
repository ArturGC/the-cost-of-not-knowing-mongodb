import { type Document, MongoClient } from 'mongodb';

import type * as T from '../types';

const getGroupPipeline = (filter: Document, { t0 }: { t0: Date }): Document[] => {
  return [
    {
      $match: filter,
    },
    {
      $addFields: {
        timestamp: {
          $dateAdd: {
            startDate: new Date('2024-01-01'),
            unit: 'millisecond',
            amount: {
              $dateDiff: {
                startDate: t0,
                endDate: '$timestamp',
                unit: 'millisecond',
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        timestamp: {
          $dateTrunc: {
            date: '$timestamp',
            unit: 'minute',
            binSize: 5,
          },
        },
      },
    },
    {
      $group: {
        _id: {
          $mergeObjects: [
            {
              app: '$metadata.app',
            },
            {
              type: '$metadata.type',
            },
            {
              timestamp: '$timestamp',
            },
          ],
        },
        count: {
          $sum: 1,
        },
        p: {
          $percentile: {
            input: '$value',
            p: [0.5, 0.9, 0.95],
            method: 'approximate',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        app: { $replaceOne: { input: '$_id.app', find: 'app', replacement: '' } },
        type: '$_id.type',
        timestamp: '$_id.timestamp',
        count: 1,
        mean: { $arrayElemAt: ['$p', 0] },
        p90: { $arrayElemAt: ['$p', 1] },
        p95: { $arrayElemAt: ['$p', 2] },
      },
    },
    {
      $merge: {
        into: {
          db: 'prod',
          coll: 'graph',
        },
      },
    },
  ];
};

const main = async (): Promise<void> => {
  const url = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(url);
  const db = client.db('prod');
  const measurements = db.collection<T.Measurement>('measurements');
  const graph = db.collection('graph');

  const appVersions: T.AppVersion[] = ['appV1', 'appV2', 'appV3', 'appV4'];
  appVersions.push('appV5R0', 'appV5R1', 'appV5R2', 'appV5R3', 'appV5R4');
  appVersions.push('appV6R0', 'appV6R1', 'appV6R2', 'appV6R3', 'appV6R4');

  await graph.drop();

  for (const appVersion of appVersions.reverse()) {
    const filter = { 'metadata.app': appVersion };
    const doc = await measurements.findOne(filter, { sort: { timestamp: 1 } });

    const pipeline = getGroupPipeline(filter, { t0: doc?.timestamp! }); // eslint-disable-line

    await measurements.aggregate(pipeline).toArray();
  }

  await client.close();
};

main().catch(console.error);
