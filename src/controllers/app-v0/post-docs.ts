import { type Request, type Response } from 'express';

import * as P from '../../persistence';
import { type Body } from '../body-validator';

export const endPoint = '/v0/docs';

type Handler = (
  req: Request<unknown, unknown, Body>,
  res: Response
) => Promise<Response<unknown, Record<string, unknown>>>;

export const handler: Handler = async ({ body }, res) => {
  await P.appV0.bulkUpsert(body);

  return res.status(201).send({ ok: true });
};
