import { type BulkWriteResult, type Document, type ObjectId } from 'mongodb';

export type Transaction = {
  key: number;
  date: Date;
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};

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
  | 'appV8'
  | 'appV9'
  | 'appV10'
  | 'appV11';

export type ReportYear =
  | 'oneYear'
  | 'threeYears'
  | 'fiveYears'
  | 'sevenYears'
  | 'tenYears';

export type DocV0 = {
  _id: {
    key: string;
    date: Date;
  };
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};

export type DocV1 = DocV0;

export type DocV2 = {
  _id: ObjectId;
  key: string;
  date: Date;
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};

export type DocV3 = {
  _id: Buffer;
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};

export type DocV4 = {
  _id: Buffer;
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};

export type DocV5 = {
  _id: Buffer;
  items: Record<
    string,
    {
      a?: number;
      n?: number;
      p?: number;
      r?: number;
    }
  >;
};
export type DocV6 = DocV5;
export type DocV7 = DocV5;
export type DocV8 = DocV5;

export type DocV9 = {
  _id: Buffer;
  report: {
    a?: number;
    n?: number;
    p?: number;
    r?: number;
  };
  items: Record<
    string,
    {
      a?: number;
      n?: number;
      p?: number;
      r?: number;
    }
  >;
};
export type DocV10 = DocV9;
export type DocV11 = DocV9;

export type BulkUpsert = (docs: Transaction[]) => Promise<BulkWriteResult>;

export type GetReport = (filter: {
  date: { end: Date; start: Date };
  key: Transaction['key'];
}) => Promise<Document>;

export type GetReports = (filter: {
  date: Date;
  key: Transaction['key'];
}) => Promise<Document[]>;
