export class Generator {
  constructor() {
    this.date = new Date('2015-01-01');
  }

  getDate() {
    const deltaTime = 100 * Math.random();

    this.date = new Date(this.date.getTime() + deltaTime);

    return new Date(this.date.toISOString().split('T')[0]);
  }

  gaussianRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const value = z * stdev + mean;
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
  }

  getKey() {
    return Math.floor(100 * Math.abs(this.gaussianRandom())).toString();
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
      const date = this.getDate();
      const key = this.getKey();
      const transaction = this.getTransaction();

      return Object.assign({ date, key }, transaction);
    });
  }
}
