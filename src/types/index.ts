import { z } from 'zod';

export type DocDefault = z.infer<typeof DocDefaultSchema>;
export const DocDefaultSchema = z.object({
  approved: z.number().optional(),
  date: z.coerce.date(),
  key: z.string(),
  noFunds: z.number().optional(),
  pending: z.number().optional(),
  rejected: z.number().optional(),
});

export type DocV0 = z.infer<typeof DocV0Schema>;
export const DocV0Schema = z.object({
  _id: z.object({
    date: z.coerce.date(),
    key: z.string(),
  }),
  approved: z.number().optional(),
  noFunds: z.number().optional(),
  pending: z.number().optional(),
  rejected: z.number().optional(),
});
