/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';

import * as getReport from './get-reports';
import * as postDocs from './post-docs';
import { bodyValidator } from './body-validator';

export const routes = Router()
  .post(postDocs.endPoint, bodyValidator(), postDocs.handler)
  .get(getReport.endPoint, getReport.handler);
