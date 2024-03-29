# Steps for getting load and production report data

- Change `APP_VERSION` on `client/load/ecosystem.config.js` and `client/production/ecosystem.config.js`
- Run load: `npm run load`
- When finish loading:
  - Stop load: `pm2 delete load`
  - Get collection data: Documents, Logical Size, Document Size, Storage Size, Index Size (print)
  - Get load report
  - Print Atlas Metrics: 4x5 with cursor;
  - Wait 10 minutes
- Run production: `npm run production`
- When finish production:
  - Stop production: `pm2 delete production`
  - Get collection data: Documents, Logical Size, Document Size, Storage Size, Index Size (print)
  - Get load report
  - Print Atlas Metrics: 4x5 with cursor;
  - Wait 10 minutes
