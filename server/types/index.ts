import { type BulkWriteResult, type Document, type ObjectId } from 'mongodb';
import { z } from 'zod';

export type BulkUpsert = (docs: Body) => Promise<BulkWriteResult>;
export type GetReport = (filter: {
  date: { end: Date; start: Date };
  key: string;
}) => Promise<Document>;

export type GetReports = (filter: {
  date: Date;
  key: string;
}) => Promise<Document[]>;

export type DocDefault = z.infer<typeof DocDefaultSchema>;
export const DocDefaultSchema = z.object({
  date: z.coerce.date(),
  key: z.string(),

  approved: z.number().optional(),
  noFunds: z.number().optional(),
  pending: z.number().optional(),
  rejected: z.number().optional(),
});

export type Version =
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
  | 'appV10';

export type ReportYear =
  | 'oneYear'
  | 'threeYears'
  | 'fiveYears'
  | 'sevenYears'
  | 'tenYears';

export type Body = z.infer<typeof BodySchema>;
export const BodySchema = z.array(DocDefaultSchema);

export type DocV0 = {
  _id: {
    date: Date;
    key: string;
  };
  approved?: number;
  noFunds?: number;
  pending?: number;
  rejected?: number;
};

export type DocV1 = DocV0;

export type DocV2 = {
  _id: ObjectId;
  date: Date;
  key: string;
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

export type DocV6 = {
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

export type DocV7 = DocV6;

export type DocV8 = DocV5;

export type DocV9 = DocV8;

export type DocV10 = {
  _id: ObjectId;
  date: Date;
  key: Buffer;
  a?: number;
  n?: number;
  p?: number;
  r?: number;
};
