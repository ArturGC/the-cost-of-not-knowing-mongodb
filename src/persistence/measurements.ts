import type * as T from '../types';
import mdb from '../mdb';

export const insertOne = async ({
  app,
  timestamp,
  type,
  value,
}: {
  app: T.AppVersion;
  timestamp: Date;
  type: T.Measurement['metadata']['type'];
  value: number;
}): Promise<void> => {
  await mdb.collections.measurements.insertOne(
    { metadata: { app, type }, timestamp, value },
    { writeConcern: { w: 0, j: false } }
  );
};
