import { type BulkWriteResult, type Document, type ObjectId } from 'mongodb';

export type Events = {
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};

type EventsLong = {
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};

export type Transaction = { key: number; date: Date } & Events;

export type Base = {
  _id: ObjectId;
  appSynced?: AppVersion;
  date: Date;
  transactions: Transaction[];
  worker: number;
};

export type Measurement = {
  metadata: {
    app: AppVersion;
    type: 'bulkUpsert' | 'getReports';
  };
  timestamp: Date;
  value: number;
};

export type AppVersion =
  | 'appV0'
  | 'appV1'
  | 'appV2'
  | 'appV3'
  | 'appV4'
  | 'appV5'
  | 'appV6'
  | 'appV7'
  | 'appV8';
// | 'appV9'
// | 'appV10'
// | 'appV11';

export type ReportYear =
  | 'oneYear'
  | 'threeYears'
  | 'fiveYears'
  | 'sevenYears'
  | 'tenYears';

export type SchemaV0 = {
  _id: {
    key: string;
    date: Date;
  };
} & EventsLong;

export type SchemaV1 = {
  _id: ObjectId;
  key: string;
  date: Date;
} & EventsLong;

export type SchemaV2 = {
  _id: Buffer;
} & EventsLong;

export type SchemaV3 = {
  _id: Buffer;
} & Events;

export type SchemaV4 = {
  _id: Buffer;
  items: Record<string, Events>;
};

export type SchemaV5 = {
  _id: Buffer;
  report: Events;
  items: Record<string, Events>;
};

export type SchemaV6 = {
  _id: Buffer;
  items: Array<{ date: Date } & Events>;
};

export type BulkUpsert = (docs: Transaction[]) => Promise<BulkWriteResult>;

export type GetReport = (filter: {
  date: { end: Date; start: Date };
  key: Transaction['key'];
}) => Promise<Document>;

export type GetReports = (filter: {
  date: Date;
  key: Transaction['key'];
}) => Promise<Document[]>;
