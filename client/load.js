import http from 'k6/http';
import { check } from 'k6';

import * as cfg from './cfg.js';
import { Generator } from './generator.js';

export const options = {
  scenarios: {
    postDocs: {
      exec: 'postDocs',
      executor: 'per-vu-iterations',
      iterations: cfg.load.postDocs.Iterations,
      maxDuration: '5h',
      vus: cfg.load.postDocs.VusQuantity,
    },
  },
};

const appVersion = 'appV0';
const url = `http://localhost:3000/docs/${appVersion}`;
const generator = new Generator(cfg.load.postDocs.DateStart);
const params = { headers: { 'Content-Type': 'application/json' } };

export async function postDocs() {
  const body = generator.getBody();
  const res = http.post(url, body, params);

  check(res, { 'Is status 201?': (r) => r.status === 201 });

  await cfg.sleep(2000 * Math.random() - res.timings.duration);
}
