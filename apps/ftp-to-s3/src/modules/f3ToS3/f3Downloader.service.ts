import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as appJSON from '../../../app.json';
import { Sequelize } from 'sequelize-typescript';
import { FTPTOS3Model } from './ftp_to_s3.entity';
import { CronJob } from 'cron';
import { CRON_FTP_DOWNLOADER, ftpClient } from '../../core/ftpClient';


@Injectable()
export class FTPDownloaderSchedulerService {
  private clientApp;
  private readonly logger = new Logger(FTPDownloaderSchedulerService.name);
  constructor(
    // @InjectConnection(MAIN_DATABASE_CONNECTION)
    // @InjectConnection()
    // private rtTradingConnection: Connection,
    private schedulerRegistry: SchedulerRegistry,
    @InjectModel(FTPTOS3Model)
    private readonly depositBlacklistRepositories: typeof FTPTOS3Model,
    // @InjectModel(NotificationModel, BCA_CONNECTION)
    // private readonly notificationRepositories: typeof NotificationModel,
    private readonly sequelizeInstance: Sequelize,
  ) {

  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: CRON_FTP_DOWNLOADER })
  handleCron() {
    this.logger.debug('handleCronTryCatch');
    this.handleCronTryCatch();
  }

  async handleCronTryCatch() {
    this.logger.log(
      '==== SCHEDULER START : Process ==== api v' + appJSON.version,
    );
    const job = this.schedulerRegistry.getCronJob(CRON_FTP_DOWNLOADER);
    job.stop();

    try {
      await this.process(job);
    } catch(err) {
      this.logger.error('PROCESS FAILED', err);
      if (ftpClient) {
        this.logger.log('FTP Connection closed');
        ftpClient.close();
      }
    }

    this.logger.log(
      '==== SCHEDULER END : Process ==== api v' + appJSON.version,
    );
    job.start();
  }

  async init() {
    this.logger.log('ftpClient', ftpClient);
    ftpClient.ftp.verbose = true;
    try {
      const config = {
        host: process.env.FTP_HOST,
        port: Number(process.env.FTP_PORT),
        user: process.env.FTP_USERNAME,
        password: process.env.FTP_PASSWORD,
        secure: false,
      };

      this.logger.log('config', config);
      if (ftpClient.closed) {
        const resConnect = await ftpClient.access(config);
        this.logger.log('resConnect', resConnect);
      } else {
        ftpClient.close();
        const resConnect = await ftpClient.access(config);
        this.logger.log('resConnect after close', resConnect);
      }

      const list = await ftpClient.list();

      this.logger.log('list files', JSON.stringify(list));
      for (const item of list) {
        this.logger.log('item', JSON.stringify(item));
      }
      // await ftpClient.downloadTo('README_COPY.md', 'README_FTP.md');
    } catch (err) {
      this.logger.error(err);
      return Promise.reject(err);
    }
  }

  async process(job: CronJob) {
    await this.init();
    await this.downloadFromFTP();
  }

  async downloadFromFTP() {
    const resDownload = await ftpClient.downloadTo(
      process.env.DOWNLOADED_DIR,
      process.env.FTP_REMOTE_DIR,
    );

    this.logger.log('resDownload', resDownload);
  }
}
