import { parentPort, workerData } from 'worker_threads';

const fibonacci = (n: number): number => {
  return n < 1 ? 0 : n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
};

const result = fibonacci(workerData.iterations as number);

parentPort?.postMessage(result);
