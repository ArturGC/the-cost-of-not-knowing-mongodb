import { vu } from 'k6/execution';
import cfg from './cfg.js';

export class Generator {
  constructor() {
    this.date = cfg.dateStart;
    this.keysQuantity = cfg.usersPerVu;
  }

  getReportDateRange() {
    const deltaTime = Math.floor(5 * cfg.oneYear * Math.random());
    const dateEnd = this.date.getTime();
    const dateStart = new Date(dateEnd.getTime() - deltaTime);

    return {
      start: dateStart.toISOString().split('T')[0],
      end: dateEnd.toISOString().split('T')[0],
    };
  }

  getNewDate() {
    const deltaTime = 2 * cfg.deltaTime * Math.random();

    this.date = new Date(this.date.getTime() + deltaTime);

    return new Date(this.date.toISOString().split('T')[0]);
  }

  gaussianRandom(mean = 0, stdev = 0.05) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    return z * stdev + mean;
  }

  getKey() {
    const vuId = `${vu.idInTest}`.padStart(2, '0');
    const keyNumber =
      Math.random() > 0.25
        ? Math.floor(this.keysQuantity * Math.abs(this.gaussianRandom()))
        : Math.floor(this.keysQuantity * Math.random());

    return `${vuId}A${keyNumber}`.padEnd(64, 'B');
  }

  getTransaction() {
    const value = Math.random();

    if (value < 0.8) return { approved: 1 };
    else if (value < 0.9) return { pending: 1 };
    else if (value < 0.975) return { noFunds: 1 };
    else return { rejected: 1 };
  }

  body(count) {
    return Array.from({ length: count }, () => {
      const date = this.getNewDate();
      const key = this.getKey();
      const transaction = this.getTransaction();

      return Object.assign({ key, date }, transaction);
    });
  }
}
