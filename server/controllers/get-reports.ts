import { type Request, type Response } from 'express';

import * as P from '../persistence';
import type * as T from '../types';

export const endPoint = '/reports/:version';

type Handler = (
  req: Request<
    { version: T.Version },
    unknown,
    unknown,
    { dateEnd: string; dateStart: string; key: string }
  >,
  res: Response
) => Promise<Response<unknown, Record<string, unknown>>>;

export const handler: Handler = async ({ query, params }, res) => {
  const { version } = params;
  const [result] = await P[version].getReport({
    date: { end: new Date(query.dateEnd), start: new Date(query.dateStart) },
    key: query.key,
  });

  return res
    .status(201)
    .send(result !== undefined ? { ...result } : { ok: false });
};
