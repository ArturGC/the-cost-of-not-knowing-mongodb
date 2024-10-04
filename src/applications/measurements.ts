import type * as T from '../types';
import mdb from '../mdb';

type InsertOne = (args: {
  app: T.AppVersion;
  timestamp: Date;
  type: T.Measurement['metadata']['type'];
  value: number;
}) => void;

export const insertOne: InsertOne = ({ app, timestamp, type, value }) => {
  mdb.collections.measurements
    .insertOne({ metadata: { app, type }, timestamp, value }, { writeConcern: { w: 0, j: false } })
    .catch(console.error);
};
