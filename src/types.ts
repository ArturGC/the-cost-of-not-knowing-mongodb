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

export type AppVersion = 'appV6R4';

export type EventsScenarios = {
  _id: ObjectId;
  app?: AppVersion;
  date: Date;
  worker: number;
  events: Event[];
};

export type SchemaV5R0 = {
  _id: Buffer;
  items: Record<string, OperationsShort>;
};

export type WorkerData = { appVersion: AppVersion; id: number };

export type BulkUpsert = (docs: Event[]) => Promise<BulkWriteResult>;

export type Measurement = {
  metadata: {
    app: AppVersion;
    type: 'bulkUpsert' | 'getReports';
  };
  timestamp: Date;
  value: number;
};

export type ReportYear = 'oneYear' | 'threeYears' | 'fiveYears' | 'sevenYears' | 'tenYears';
export type GetReports = (filter: { date: Date; key: Event['key'] }) => Promise<Document[]>;
