import http from 'k6/http';
import { check } from 'k6';

import { production } from './cfg.js';
import { Generator } from './generator.js';

export const options = {
  scenarios: {
    post_docs: {
      exec: 'postDocs',
      executor: 'constant-vus',
      vus: production.vuQuantity,
      duration: production.duration,
    },
    get_report: {
      exec: 'getReport',
      executor: 'constant-vus',
      vus: production.vuQuantity,
      duration: production.duration,
    },
  },
};

const urlDocs = 'http://localhost:3000/docs/appV0';
const urlReports = 'http://localhost:3000/docs/appV0';
const generator = new Generator();
const params = { headers: { 'Content-Type': 'application/json' } };

export function postDocs() {
  const body = JSON.stringify(generator.body(cfg.batchSize));
  const res = http.post(urlDocs, body, params);

  check(res, { 'Is status 201?': (r) => r.status === 201 });
}

export function getReport() {
  const { start, end } = generator.getReportDateRange();
  const url = `${urlReports}/?dateStart=${start}&dateEnd=${end}`;
  const res = http.get(url);

  check(res, { 'Is status 201?': (r) => r.status === 201 });
}
