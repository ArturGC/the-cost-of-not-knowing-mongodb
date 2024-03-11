import { type ObjectId } from 'mongodb';
import { z } from 'zod';

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
  | 'appV7';

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
  _id: string;
  items: Record<string, { a?: number; n?: number; p?: number; r?: number }>;
};

export type DocV6 = {
  _id: string;
  report: { a?: number; n?: number; p?: number; r?: number };
  items: Record<string, { a?: number; n?: number; p?: number; r?: number }>;
};

export type DocV7 = DocV6;
