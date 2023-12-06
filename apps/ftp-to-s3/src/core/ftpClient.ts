import * as ftp from 'basic-ftp';
// import * as Client from 'ssh2-sftp-client';

const ftpClient = new ftp.Client(0);
// const ftpClient = new Client();

const CRON_FTP_DOWNLOADER = 'CRON_FTP_DOWNLOADER';

async function ftpClose() {
  if (!ftpClient.closed) {
    ftpClient.close();
  }
  // await ftpClient.end();
}

async function ftpConnect(config: ftp.AccessOptions) {
  console.info('config', config);
  await ftpClose();
  const resConnect = await ftpClient.access(config);
  // const resConnect = await ftpClient.connect(config);
  console.info('resConnect', resConnect);

}

async function ftpGetFiles(remotePath?: string) {
  const list = await ftpClient.list(remotePath);
  console.info('list files', JSON.stringify(list));
  for (const item of list) {
    console.info('item', JSON.stringify(item));
  }
  return list;
}

async function ftpDownload(localDir: string, remoteDir: string) {
  console.info('ftpDownload started');
  const resDownload = await ftpClient.downloadToDir(
    localDir,
    remoteDir,
  );
  // const resDownload = await ftpClient.downloadDir(remoteDir, localDir);
  console.info('resDownload', resDownload);

  return resDownload;
}

export { ftpClient, ftpConnect, ftpClose, ftpGetFiles, ftpDownload, CRON_FTP_DOWNLOADER };