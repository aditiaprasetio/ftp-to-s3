/* eslint-disable @typescript-eslint/camelcase */
module.exports = {
  apps: [
    {
      name: 'ftp-to-s3-production',
      script: './main.js',
      watch: true,
      cron_restart: '0 0 * * *',
      exp_backoff_restart_delay: 100,
    },
  ],
};
