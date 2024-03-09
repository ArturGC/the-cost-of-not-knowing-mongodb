import { type NextFunction, type Request, type Response } from 'express';

import * as T from '../types';

type BodyValidator = () => (
  req: Request,
  res: Response,
  next: NextFunction
) => void | never;

export const bodyValidator: BodyValidator = () => {
  return (req, res, next) => {
    const result = T.BodySchema.safeParse(req.body);

    if (!result.success) throw new Error(JSON.stringify(result.error));

    req.body = result.data;

    next();
  };
};
