import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as appJSON from '../../../app.json';
import { Sequelize } from 'sequelize-typescript';
import { FTPTOS3Model } from './ftp_to_s3.entity';
import { CronJob } from 'cron';
import { ftpClose, CRON_FTP_DOWNLOADER, ftpClient, ftpDownload, ftpGetFiles } from '../../core/ftpClient';

let isHang = false;

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
    // this.logger.debug('handleCronTryCatch');
    // this.handleCronTryCatch();
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
      if (ftpClient && !ftpClient.closed) {
        this.logger.log('FTP Connection closed');
        ftpClose();
      }
    }

    this.logger.log(
      '==== SCHEDULER END : Process ==== api v' + appJSON.version,
    );
    job.start();
  }

  async process(job: CronJob) {
    if (isHang) {
      this.logger.error('FTP hang... will close connection');
      ftpClose();
      isHang = false;
      return;
    }

    if (!ftpClient.closed) {
      this.logger.log('FTP active... will download');
      await this.downloadFromFTP();
    } else {
      this.logger.error('FTP not started');
    }
  }

  async downloadFromFTP() {
    isHang = true;
    await ftpGetFiles(process.env.FTP_REMOTE_DIR);
    isHang = false;
    
    ftpDownload(process.env.DOWNLOADED_DIR, process.env.FTP_REMOTE_DIR);
  }
}
