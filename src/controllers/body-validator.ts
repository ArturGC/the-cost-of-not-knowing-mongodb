import { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';

import * as T from '../types';

export type Body = z.infer<typeof BodySchema>;
export const BodySchema = z.array(T.DocDefaultSchema);

type BodyValidator = () => (
  req: Request,
  res: Response,
  next: NextFunction
) => void | never;

export const bodyValidator: BodyValidator = () => {
  return (req, res, next) => {
    const result = BodySchema.safeParse(req.body);

    if (!result.success) throw new Error(JSON.stringify(result.error));

    req.body = result.data;

    next();
  };
};
