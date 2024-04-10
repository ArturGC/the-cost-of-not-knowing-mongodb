module.exports = {
  apps: [
    {
      autorestart: false,
      exec_mode: 'fork',
      instances: 1,
      name: 'run',
      script: './src/run.sh',
      watch: false,
      out_file: '/dev/null',
      error_file: '/dev/null',
    },
  ],
};
