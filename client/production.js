import http from 'k6/http';
import { check } from 'k6';

import * as cfg from './cfg.js';
import { Generator } from './generator.js';

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

const appVersion = 'appV0';
const urlDocs = `http://localhost:3000/docs/${appVersion}`;
const urlReports = `http://localhost:3000/docs/${appVersion}`;
const generator = new Generator(cfg.production.postDocs.DateEnd);
const params = { headers: { 'Content-Type': 'application/json' } };

export function postDocs() {
  const body = generator.getBody();
  const res = http.post(urlDocs, body, params);

  check(res, { 'Is status 201?': (r) => r.status === 201 });
}

export function getReport() {
  const queryParams = generator.getReportQueryParams();
  const res = http.get(`${urlReports}/?${queryParams}`);

  check(res, { 'Is status 201?': (r) => r.status === 201 });
}
