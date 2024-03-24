import { vu } from 'k6/execution';
import * as cfg from './cfg.js';

export class Generator {
  constructor(dateStart) {
    this.date = {
      current: dateStart,
    };
  }

  getKeyReport() {
    const vuIdNumber = Math.ceil(cfg.load.postDocs.VusQuantity * Math.random());
    const keyNumber = cfg.production.postDocs.UsersPerVu * Math.random();

    return (
      `${vuIdNumber}`.padStart(2, '0') +
      `${Math.ceil(keyNumber)}`.padStart(62, '0')
    );
  }

  getReportQueryParams() {
    const date = this.date.current.toISOString().split('T')[0];
    const key = this.getKeyReport();

    return `key=${key}&date=${date}`;
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
