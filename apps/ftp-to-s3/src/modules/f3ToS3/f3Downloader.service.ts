import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as appJSON from '../../../app.json';
import { Sequelize } from 'sequelize-typescript';
import { FTPTOS3Model } from './ftp_to_s3.entity';
import { CronJob } from 'cron';
import ftpClient from 'ftp-client';

const CRON_FTP_TO_S3 = 'CRON_FTP_TO_S3';

@Injectable()
export class FTPTOS3SchedulerService {
  private ftpClientApp;
  private readonly logger = new Logger(FTPTOS3SchedulerService.name);
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

  @Cron(CronExpression.EVERY_10_SECONDS, { name: CRON_FTP_TO_S3 })
  handleCron() {
    this.logger.debug('handleCronTryCatch');
    this.handleCronTryCatch();
  }

  async handleCronTryCatch() {
    this.logger.log(
      '==== SCHEDULER START : Process ==== api v' + appJSON.version,
    );
    const job = this.schedulerRegistry.getCronJob(CRON_FTP_TO_S3);
    job.stop();

    try {
      await this.process(job);
    } catch(err) {
      this.logger.error('PROCESS FAILED', err);
    }

    this.logger.log(
      '==== SCHEDULER END : Process ==== api v' + appJSON.version,
    );
    job.start();
  }

  async init() {
    const config = {
      host: process.env.FTP_HOST,
      port: process.env.FTP_PORT,
      user: process.env.FTP_USERNAME,
      password: process.env.FTP_PASSWORD,
    };
    const options = {
      logging: 'debug',
      overwrite: 'older',
    };
    this.ftpClientApp = new ftpClient(config, options);
  }

  async process(job: CronJob) {
    await this.ftpClientApp.connect(() => {
      this.downloadFromFTP();
    });
  }

  async downloadFromFTP() {
    this.ftpClientApp.download(
      process.env.FTP_REMOTE_DIR,
      process.env.DOWNLOADED_DIR,
      (result) => {
        this.logger.log('download result', result);
      }
    );
  }
}
