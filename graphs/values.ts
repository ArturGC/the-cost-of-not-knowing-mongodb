/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type Document, MongoClient } from 'mongodb';

import type * as T from '../src/types';
import refs from '../src/references';

const getGroupPipeline = (filter: Document, { t0 }: { t0: Date }): Document[] => {
  return [
    {
      $match: filter,
    },
    {
      $addFields: {
        percentPassed: {
          $divide: [
            {
              $dateDiff: {
                startDate: t0,
                endDate: '$timestamp',
                unit: 'millisecond',
              },
            },
            refs.prod.duration,
          ],
        },
      },
    },
    {
      $addFields: {
        stage: {
          $divide: [
            {
              $mod: ['$percentPassed', 0.25],
            },
            0.25,
          ],
        },
      },
    },
    {
      $addFields: {
        desired: {
          $arrayToObject: [
            [
              [
                'getReports',
                {
                  $switch: {
                    branches: [
                      { case: { $lt: ['$stage', 0.1] }, then: 25 },
                      { case: { $lt: ['$stage', 0.2] }, then: 50 },
                      { case: { $lt: ['$stage', 0.3] }, then: 75 },
                      { case: { $lt: ['$stage', 0.4] }, then: 100 },
                      { case: { $lt: ['$stage', 0.5] }, then: 125 },
                      { case: { $lt: ['$stage', 0.6] }, then: 150 },
                      { case: { $lt: ['$stage', 0.7] }, then: 175 },
                      { case: { $lt: ['$stage', 0.8] }, then: 200 },
                      { case: { $lt: ['$stage', 0.9] }, then: 225 },
                    ],
                    default: 250,
                  },
                },
              ],
              [
                'bulkUpsert',
                {
                  $switch: {
                    branches: [
                      { case: { $lt: ['$percentPassed', 0.25] }, then: 250 },
                      { case: { $lt: ['$percentPassed', 0.5] }, then: 500 },
                      { case: { $lt: ['$percentPassed', 0.75] }, then: 750 },
                    ],
                    default: 1000,
                  },
                },
              ],
            ],
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          $mergeObjects: [
            { app: '$metadata.app' },
            // { type: '$metadata.type' },
            { getReports: '$desired.getReports' },
            { bulkUpsert: '$desired.bulkUpsert' },
          ],
        },
        getReports: {
          $sum: { $cond: [{ $eq: ['$metadata.type', 'getReports'] }, 1, 0] },
        },
        bulkUpsert: {
          $sum: { $cond: [{ $eq: ['$metadata.type', 'bulkUpsert'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        app: { $replaceOne: { input: '$_id.app', find: 'app', replacement: '' } },
        desired: {
          $mergeObjects: [{ getReports: '$_id.getReports' }, { bulkUpsert: '$_id.bulkUpsert' }],
        },
        obtained: {
          $mergeObjects: [
            { getReports: { $round: [{ $divide: ['$getReports', 5 * 60] }, 0] } },
            { bulkUpsert: { $round: [{ $multiply: [250, { $divide: ['$bulkUpsert', 5 * 60] }] }, 0] } },
          ],
        },
      },
    },
    {
      $merge: {
        into: {
          db: 'prod',
          coll: 'values',
        },
      },
    },
  ];
};

const main = async (): Promise<void> => {
  const url = 'mongodb+srv://arturgc:arturgc_123@ragnarok.qicxjmm.mongodb.net/';
  // const url = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(url);
  const db = client.db('prod');
  const measurements = db.collection<T.Measurement>('measurements');
  const values = db.collection('values');

  const appVersions: T.AppVersion[] = ['appV1', 'appV2', 'appV3', 'appV4'];
  appVersions.push('appV5R0', 'appV5R1', 'appV5R2', 'appV5R3', 'appV5R4');
  appVersions.push('appV6R0', 'appV6R1', 'appV6R2', 'appV6R3', 'appV6R4');

  await values.drop();

  for (const appVersion of appVersions.reverse()) {
    const filter = { 'metadata.app': appVersion };
    const doc = await measurements.findOne(filter, { sort: { timestamp: 1 } });

    const pipeline = getGroupPipeline(filter, { t0: doc?.timestamp! });

    await measurements.aggregate(pipeline).toArray();
  }

  await client.close();
};

main().catch(console.error);
