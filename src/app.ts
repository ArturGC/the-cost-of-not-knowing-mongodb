import 'express-async-errors';
import express from 'express';

import { routes } from './controllers';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(routes);

export default app;
