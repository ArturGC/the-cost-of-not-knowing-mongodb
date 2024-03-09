import http from 'k6/http';
import { Generator } from './helpers.js';

export const options = {
  stages: [{ duration: '30s', target: 1 }],
};

const generator = new Generator();
const params = { headers: { 'Content-Type': 'application/json' } };

export default function () {
  const url = 'http://localhost:3000/v0/docs';
  const body = generator.body(1000);
  const payload = JSON.stringify(body);

  http.post(url, payload, params);
}
