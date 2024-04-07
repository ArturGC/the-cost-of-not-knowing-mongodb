import type * as T from '../types';
import config from '../config';
import mdb from '../mdb';

const appVersion = config.APP.VERSION;

export const insertOne = async ({
  timestamp,
  type,
  value,
}: {
  timestamp: Date;
  type: T.Measurement['metadata']['type'];
  value: number;
}): Promise<void> => {
  await mdb.collections.measurements.insertOne({
    metadata: { app: appVersion, type },
    timestamp,
    value,
  });
};
