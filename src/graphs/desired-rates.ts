import { MongoClient } from 'mongodb';

import refs from '../references';

const getRateGetReports = ({ dateCurrent, dateStart }: { dateCurrent: Date; dateStart: Date }): number => {
  const msPassed = dateCurrent.getTime() - dateStart.getTime();
  const percentPassed = msPassed / refs.loadTest.duration;
  const stage = (percentPassed % 0.25) / 0.25;

  if (stage < 0.1) return 25;
  else if (stage < 0.2) return 50;
  else if (stage < 0.3) return 75;
  else if (stage < 0.4) return 100;
  else if (stage < 0.5) return 125;
  else if (stage < 0.6) return 150;
  else if (stage < 0.7) return 175;
  else if (stage < 0.8) return 200;
  else if (stage < 0.9) return 225;
  else return 250;
};

const getRateBulkUpsert = ({ dateCurrent, dateStart }: { dateCurrent: Date; dateStart: Date }): number => {
  const msPassed = dateCurrent.getTime() - dateStart.getTime();
  const percentPassed = msPassed / refs.loadTest.duration;

  if (percentPassed < 0.25) return 250;
  else if (percentPassed < 0.5) return 500;
  else if (percentPassed < 0.75) return 750;
  else return 1000;
};

const main = async (): Promise<void> => {
  const url = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(url);
  const db = client.db('prod');
  const desiredRates = db.collection('desiredRates');
  const dateStart = new Date('2024-01-01');

  for (let i = 0; i <= 200; i += 1) {
    const dateCurrent = new Date(dateStart.getTime() + i * 60 * 1000);

    await desiredRates.insertOne({
      timestamp: dateCurrent,
      bulkUpsert: getRateBulkUpsert({ dateCurrent, dateStart }),
      getReports: getRateGetReports({ dateCurrent, dateStart }),
    });
  }

  await client.close();
};

main().catch(console.error);
