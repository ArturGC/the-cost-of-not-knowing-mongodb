import 'express-async-errors';
import express from 'express';

import { appV0 } from './controllers/app-v0';

const app = express();

app.use(express.json());
app.use(appV0);

export default app;
