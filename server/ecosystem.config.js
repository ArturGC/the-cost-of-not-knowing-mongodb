module.exports = {
  apps: [
    {
      autorestart: true,
      exec_mode: 'fork',
      instances: 1,
      name: 'server',
      script: 'npx ts-node ./index.ts',
      watch: false,

      env: {
        EXEC_ENV: 'test',
      },
    },
  ],
};
