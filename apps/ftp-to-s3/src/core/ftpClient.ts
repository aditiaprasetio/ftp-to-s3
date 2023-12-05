import * as ftp from 'basic-ftp';
const ftpClient = new ftp.Client(0);

const CRON_FTP_DOWNLOADER = 'CRON_FTP_DOWNLOADER';

export { ftpClient, CRON_FTP_DOWNLOADER };