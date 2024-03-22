import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';

import * as cfg from '../cfg.js';
import { Generator } from '../generator.js';

export const options = {
  scenarios: {
    postDocs: {
      exec: 'postDocs',
      executor: 'per-vu-iterations',
      iterations: cfg.load.postDocs.Iterations,
      maxDuration: '20h',
      vus: cfg.load.postDocs.VusQuantity,
    },
  },
};

const url = `http://localhost:3000/docs/${__ENV.APP_VERSION}`;
const generator = new Generator(cfg.load.postDocs.DateStart);
const params = { headers: { 'Content-Type': 'application/json' } };

const postDocsCounter = new Counter('docs_counter');
const postDocsTrend = new Trend('docs_trend', true);

export function postDocs() {
  const body = generator.getBody();
  const res = http.post(url, body, params);

  postDocsCounter.add(cfg.load.postDocs.BatchSize);
  postDocsTrend.add(res.timings.duration);
}
