import { Controller, Get, HttpException, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { getErrorStatusCode } from 'libs/utils/error';
import { ftpConnect, CRON_FTP_DOWNLOADER, ftpClient, ftpClose } from '../../core/ftpClient';

import * as FTPClient from 'ftp';
import * as fs from 'fs';
const c = new FTPClient();

// eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
const EasyFtp = require('easy-ftp');
const easyFtp = new EasyFtp();

@ApiTags('FTP')
@Controller('ftp')
export class FTPDownloaderController {
  private readonly logger = new Logger(FTPDownloaderController.name);
  constructor(private schedulerRegistry: SchedulerRegistry) {
    //
  }

  @Get('connect')
  async connect() {
    this.logger.log('FTP start to connect');
    this.logger.log('ftpClient', JSON.stringify(ftpClient));
    ftpClient.ftp.verbose = true;
    try {
      const config = {
        host: process.env.FTP_HOST,
        port: Number(process.env.FTP_PORT),
        user: process.env.FTP_USERNAME,
        password: process.env.FTP_PASSWORD,
        secure: false,
      };

      ftpConnect(config);

      // const list = await ftpClient.list();

      // this.logger.log('list files', JSON.stringify(list));
      // for (const item of list) {
      //   this.logger.log('item', JSON.stringify(item));
      // }
      // await ftpClient.downloadTo('README_COPY.md', 'README_FTP.md');

      return { isSuccess: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(err, getErrorStatusCode(err));
    }
  }

  @Get('close')
  async closeConnection(): Promise<{ isSuccess: boolean }> {
    try {
      await ftpClose();

      const job = this.schedulerRegistry.getCronJob(CRON_FTP_DOWNLOADER);
      job.start();

      return { isSuccess: true };
    } catch (err) {
      throw new HttpException(err, getErrorStatusCode(err));
    }
  }

  @Get('try-ftp')
  async tryFTP() {
    const config = {
      host: process.env.FTP_HOST,
      port: Number(process.env.FTP_PORT),
      user: process.env.FTP_USERNAME,
      password: process.env.FTP_PASSWORD,
      secure: false,
    };
    c.on('ready', function() {
      console.info("READY");
      console.info('process.env.FTP_REMOTE_DIR', process.env.FTP_REMOTE_DIR);

      c.cwd(process.env.FTP_REMOTE_DIR, (err, currentDir) => {
          console.error('cwd - err', err);
          console.info('cwd - currentDir', currentDir);

        c.listSafe((err, list) => {
          console.error('listSafe - err', err);
          console.info('listSafe - list', list);

          if (err) {
            console.error('ERROR GET LIST', err);
          }
          if (list) {
            for (const item of list) {
              console.log('item', item);
            }
          }

          console.info('will end ftp connection');
          c.destroy();
        });
      });
      
      // c.get('foo.txt', function(err, stream) {
      //   if (err) throw err;
      //   stream.once('close', function() {
      //     c.end();
      //   });
      //   stream.pipe(fs.createWriteStream('foo.local-copy.txt'));
      // });
    });

    c.on('greeting', function(msg) {
      console.info("GREETING", msg);
    });

    c.on('close', function(hadErr) {
      console.error('CLOSED', hadErr ? 'hadErr' : 'No hadErr');
    });
    c.on('end', function() {
      console.error('ENDED');
    });
    c.on('error', function(err) {
      console.error('ERROR', err);
    });
    
    
    c.connect(config);
  }

  @Get('try-easy-ftp')
  async tryEasyFtp() {
    const config: any = {
      host: process.env.FTP_HOST,
      port: Number(process.env.FTP_PORT),
      username: process.env.FTP_USERNAME,
      password: process.env.FTP_PASSWORD,
      secure: false,
      type: 'ftp',
    };
    console.info('before connect');
    easyFtp.connect(config);
    console.info('after connect');
    easyFtp.cd('REMAX');
    console.info('after cd to REMAX');
    // easyFtp.cd('genius');
    // console.info('after cd to genius');
    easyFtp.ls('genius', (err, list) => {
      console.error('ls - err', err);
      console.info('ls - list', list);

      (easyFtp as any).close();
    });
    easyFtp.download('genius', process.env.DOWNLOADED_DIR, function(err) {
      console.error('download - err', err);
    });
  }
}
