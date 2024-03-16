import { vu } from 'k6/execution';
import * as cfg from './cfg.js';

export class Generator {
  constructor(dateStart) {
    this.date = {
      current: dateStart,
    };
  }

  getDateRange() {
    const deltaTime = Math.ceil(5 * cfg.references.OneYearInMs * Math.random());
    const dateEnd = this.date.current;
    const dateStart = new Date(dateEnd.getTime() - deltaTime);

    return {
      start: dateStart.toISOString().split('T')[0],
      end: dateEnd.toISOString().split('T')[0],
    };
  }

  getKeyReport() {
    const vuId = `${vu.idInTest}`.padStart(2, '0');
    const keyNumber = cfg.production.postDocs.UsersPerVu * Math.random();

    return vuId + `${Math.ceil(keyNumber)}`.padStart(62, '0');
  }

  getReportQueryParams() {
    const { start, end } = this.getDateRange();
    const key = this.getKeyReport();
    console.log({ key, start, end });

    return `key=${key}&dateStart=${start}&dateEnd=${end}`;
  }

  getNewDate() {
    const deltaTime = 2 * cfg.load.postDocs.DeltaTime * Math.random();

    this.date.current = new Date(this.date.current.getTime() + deltaTime);

    return this.date.current.toISOString().split('T')[0];
  }

  gaussianRandom() {
    const [mean, stdev] = [0, 0.05];
    const [u, v] = [1 - Math.random(), Math.random()];
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    return z * stdev + mean;
  }

  getKeyLoad() {
    const vuId = `${vu.idInTest}`.padStart(2, '0');
    const keyNumber =
      Math.random() > 0.25
        ? cfg.load.postDocs.UsersPerVu * Math.abs(this.gaussianRandom())
        : cfg.load.postDocs.UsersPerVu * Math.random();

    return vuId + `${Math.ceil(keyNumber)}`.padStart(62, '0');
  }

  getTransaction() {
    const value = Math.random();

    if (value < 0.8) return { approved: 1 };
    else if (value < 0.9) return { pending: 1 };
    else if (value < 0.975) return { noFunds: 1 };
    else return { rejected: 1 };
  }

  getBody() {
    const docs = Array.from({ length: cfg.load.postDocs.BatchSize }, () => {
      const date = this.getNewDate();
      const key = this.getKeyLoad();
      const transaction = this.getTransaction();

      return Object.assign({ key, date }, transaction);
    });

    return JSON.stringify(docs);
  }
}
