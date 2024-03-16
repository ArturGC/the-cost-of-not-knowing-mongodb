import { type Request, type Response } from 'express';

import * as P from '../persistence';
import type * as T from '../types';

export const endPoint = '/docs/:version';

type Handler = (
  req: Request<{ version: T.Version }, unknown, T.Body>,
  res: Response
) => Promise<Response<unknown, Record<string, unknown>>>;

export const handler: Handler = async ({ body, params: { version } }, res) => {
  await P[version].bulkUpsert(body);

  return res.status(201).send({ ok: true });
};
