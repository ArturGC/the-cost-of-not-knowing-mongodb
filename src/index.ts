import { Worker } from 'worker_threads';

const doFib = async (iterations: number): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const worker = new Worker('./build/fib.js', { workerData: { iterations } });

    worker.once('message', (data) => {
      console.log(`doFib done in: ${Date.now() - start}ms`);
      resolve(data);
    });

    worker.once('error', (err) => reject(err));
  });
};

const main = async (): Promise<void | never> => {
  const start = Date.now();

  const values = await Promise.all(
    Array.from({ length: 10 }).map(async () => doFib(40))
  );

  console.log('values: ', values);

  console.log(`main done in: ${Date.now() - start}ms`);
};

main().catch(console.error);
