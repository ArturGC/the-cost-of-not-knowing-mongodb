import { parentPort, workerData } from 'worker_threads';

if (parentPort != null) {
  parentPort.postMessage(workerData.num * workerData.num);
}
