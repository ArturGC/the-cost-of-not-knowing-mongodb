import { PROD, TEST } from './configs';
import app from './app';
import mdb from './mdb';

const main = async (): Promise<void> => {
  const cfg = process.env.EXEC_ENV === 'prod' ? PROD : TEST;

  await mdb.connect(
    { dbName: cfg.MDB.DB_NAME, uri: cfg.MDB.URI },
    cfg.MDB.OPTIONS
  );

  await mdb.checkIndexes();

  app.listen(cfg.SERVER.PORT, () => console.log('Server Running'));
};

export default main;
