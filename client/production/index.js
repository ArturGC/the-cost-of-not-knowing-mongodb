import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';

import * as cfg from '../cfg.js';
import { Generator } from '../generator.js';

export const options = {
  scenarios: {
    postDocs: {
      exec: 'postDocs',
      executor: 'constant-vus',
      vus: cfg.production.postDocs.VusQuantity,
      duration: cfg.production.duration,
    },
    getReport: {
      exec: 'getReport',
      executor: 'constant-vus',
      vus: cfg.production.getReport.VusQuantity,
      duration: cfg.production.duration,
    },
  },
};

const urlDocs = `http://localhost:3000/docs/${__ENV.APP_VERSION}`;
const urlReports = `http://localhost:3000/reports/${__ENV.APP_VERSION}`;
const generator = new Generator(cfg.production.postDocs.DateEnd);
const params = { headers: { 'Content-Type': 'application/json' } };

const postDocsCounter = new Counter('docs_counter');
const postDocsTrend = new Trend('docs_trend', true);

export async function postDocs() {
  const body = generator.getBody();
  const res = http.post(urlDocs, body, params);

  postDocsCounter.add(cfg.production.postDocs.BatchSize);
  postDocsTrend.add(res.timings.duration);

  await cfg.production.postDocs.sleep(res.timings.duration);
}

const getReportsCounter = new Counter('reports_counter');
const getReportsTrend = new Trend('reports_trend', true);

export async function getReport() {
  const queryParams = generator.getReportQueryParams();
  const res = http.get(`${urlReports}/?${queryParams}`);

  getReportsCounter.add(1);
  getReportsTrend.add(res.timings.duration);

  await cfg.production.getReport.sleep(res.timings.duration);
}
