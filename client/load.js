import http from 'k6/http';
import { check } from 'k6';

import cfg from './cfg.js';
import { Generator } from './generator.js';

export const options = {
  scenarios: {
    post_docs: {
      exec: 'postDocs',
      executor: 'per-vu-iterations',
      iterations: cfg.iterations,
      maxDuration: '5h',
      vus: cfg.vuQuantity,
    },
  },
};

const url = 'http://localhost:3000/docs/appV0';
const generator = new Generator();
const params = { headers: { 'Content-Type': 'application/json' } };

export function postDocs() {
  const payload = JSON.stringify(generator.body(cfg.batchSize));
  const res = http.post(url, payload, params);

  check(res, { 'Is status 201?': (r) => r.status === 201 });
}
