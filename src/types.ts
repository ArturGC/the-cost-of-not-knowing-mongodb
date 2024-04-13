import { type BulkWriteResult, type Document, type ObjectId } from 'mongodb';

// Data Source
export type Transaction = { key: number; date: Date } & Events;
export type Events = {
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};

export type TransactionShort = { key: number; date: Date } & EventsShort;
export type EventsShort = {
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};

export type Base = {
  _id: ObjectId;
  appSynced?: AppVersion;
  date: Date;
  transactions: TransactionShort[];
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

// Application
export type SchemaV0 = {
  _id: {
    key: string;
    date: Date;
  };
} & Events;

export type SchemaV1 = {
  _id: ObjectId;
  key: string;
  date: Date;
} & Events;

export type SchemaV2 = {
  _id: Buffer;
} & Events;

export type SchemaV3 = {
  _id: Buffer;
} & EventsShort;

export type SchemaV4R0 = {
  _id: Buffer;
  items: Array<{ date: Date } & EventsShort>;
};

export type SchemaV4R1 = {
  _id: Buffer;
  report: EventsShort;
  items: Array<{ date: Date } & EventsShort>;
};

export type SchemaV5R0 = {
  _id: Buffer;
  items: Record<string, EventsShort>;
};

export type SchemaV5R1 = {
  _id: Buffer;
  report: EventsShort;
  items: Record<string, EventsShort>;
};

export type AppVersion =
  | 'appV0'
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

export type ReportYear =
  | 'oneYear'
  | 'threeYears'
  | 'fiveYears'
  | 'sevenYears'
  | 'tenYears';

// Operations
export type BulkUpsert = (docs: TransactionShort[]) => Promise<BulkWriteResult>;

export type GetReport = (filter: {
  date: { end: Date; start: Date };
  key: TransactionShort['key'];
}) => Promise<Document>;

export type GetReports = (filter: {
  date: Date;
  key: TransactionShort['key'];
}) => Promise<Document[]>;
