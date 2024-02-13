import { type Request, type Response } from 'express';

import * as P from '../../persistence';
import { type Body } from '../body-validator';

export const endPoint = '/v0/reports';

type Handler = (
  req: Request<
    unknown,
    unknown,
    Body,
    { dateEnd: string; dateStart: string; key: string }
  >,
  res: Response
) => Promise<Response<unknown, Record<string, unknown>>>;

export const handler: Handler = async (req, res) => {
  const [result] = await P.appV0.getReport({
    date: {
      end: new Date(req.query.dateEnd),
      start: new Date(req.query.dateStart),
    },
    key: req.query.key,
  });

  return res
    .status(201)
    .send(result !== undefined ? { ...result } : { ok: false });
};
