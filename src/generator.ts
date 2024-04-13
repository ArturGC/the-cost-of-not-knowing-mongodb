import { ObjectId } from 'mongodb';

import { type Base, type TransactionShort } from './types';
import refs from './references';

class Generator {
  dateCurrent: Date;
  dateEnd: Date;

  constructor() {
    this.dateCurrent = refs.load.dateStart;
    this.dateEnd = refs.prod.dateEnd;
  }

  getBase(worker: number): Base | undefined {
    const items = Array.from({ length: refs.base.batchSize }).map(() =>
      this.getTransaction()
    );

    if (items[0].date > this.dateEnd) return undefined;

    return {
      _id: new ObjectId(),
      date: items[0].date,
      transactions: items,
      worker,
    };
  }

  getTransaction(): TransactionShort {
    return {
      date: this.getDate(),
      key: this.getKey(),
      ...this.getEvent(),
    };
  }

  private getDate(): Date {
    this.dateCurrent = new Date(
      this.dateCurrent.getTime() + refs.base.deltaTime
    );

    return new Date(this.dateCurrent.toISOString().split('T')[0]);
  }

  private getKey(): number {
    const keyNumber =
      Math.random() < 0.6
        ? refs.base.usersQuantity * Math.random()
        : refs.base.usersQuantity * Math.abs(this.gaussianRandom());

    return Math.ceil(keyNumber);
  }

  private getEvent(): Pick<TransactionShort, 'a' | 'n' | 'p' | 'r'> {
    const value = Math.random();

    if (value < 0.8) return { a: 1 };
    else if (value < 0.9) return { n: 1 };
    else if (value < 0.975) return { p: 1 };
    else return { r: 1 };
  }

  private gaussianRandom(): number {
    const [mean, stdev] = [0, 0.015];
    const [u, v] = [1 - Math.random(), Math.random()];
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    return z * stdev + mean;
  }

  getReportKey(): number {
    return Math.ceil(refs.base.usersQuantity * Math.random());
  }
}

export default new Generator();
