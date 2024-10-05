import { type BulkWriteResult, type Document, type ObjectId } from 'mongodb';

export type Operations = {
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};

export type OperationsShort = {
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};

export type Event = {
  key: string;
  date: Date;
} & Operations;

export type EventShort = {
  key: string;
  date: Date;
} & OperationsShort;

export type AppVersion =
  | 'appV1'
  | 'appV2'
  | 'appV3'
  | 'appV4'
  | 'appV5R0'
  | 'appV5R1'
  | 'appV5R2'
  | 'appV5R3'
  | 'appV5R4'
  | 'appV6R0'
  | 'appV6R1'
  | 'appV6R2'
  | 'appV6R3'
  | 'appV6R4';

export type SchemaV1 = {
  _id: {
    key: string;
    date: Date;
  };
} & Operations;

export type SchemaV2 = {
  _id: ObjectId;
  key: string;
  date: Date;
} & Operations;

export type SchemaV3 = {
  _id: ObjectId;
  key: Buffer;
  date: Date;
} & OperationsShort;

export type SchemaV4 = {
  _id: Buffer;
} & OperationsShort;

export type SchemaV5R0 = {
  _id: Buffer;
  items: Array<{ date: Date } & OperationsShort>;
};

export type SchemaV5R1 = {
  _id: Buffer;
  totals: OperationsShort;
  items: Array<{ date: Date } & OperationsShort>;
};

export type SchemaV6R0 = {
  _id: Buffer;
  items: Record<string, OperationsShort>;
};

export type SchemaV6R1 = {
  _id: Buffer;
  totals: OperationsShort;
  items: Record<string, OperationsShort>;
};

export type WorkerData = { appVersion: AppVersion; id: number };

export type BulkUpsert = (events: Event[]) => Promise<BulkWriteResult>;

export type Measurement = {
  metadata: { app: AppVersion; type: 'bulkUpsert' | 'getReports' };
  timestamp: Date;
  value: number;
};

export type ReportYear = 'oneYear' | 'threeYears' | 'fiveYears' | 'sevenYears' | 'tenYears';
export type GetReport = (filter: { date: { end: Date; start: Date }; key: Event['key'] }) => Promise<Document>;
export type GetReports = (filter: { date: Date; key: Event['key'] }) => Promise<Document[]>;
