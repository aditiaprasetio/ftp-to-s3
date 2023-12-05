import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as appJSON from '../../../app.json';
import { Sequelize } from 'sequelize-typescript';
import { FTPTOS3Model } from './ftp_to_s3.entity';
import { CronJob } from 'cron';
import { S3Client, PutObjectAclCommand, ObjectCannedACL } from '@aws-sdk/client-s3';

const CRON_S3_UPLOADER = 'CRON_S3_UPLOADER';

@Injectable()
export class S3UploaderSchedulerService {
  private clientApp;
  private readonly logger = new Logger(S3UploaderSchedulerService.name);
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
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS, { name: CRON_S3_UPLOADER })
  handleCron() {
    this.logger.debug('handleCronTryCatch');
    // this.handleCronTryCatch();
  }

  async handleCronTryCatch() {
    this.logger.log(
      '==== SCHEDULER START : Process ==== api v' + appJSON.version,
    );
    const job = this.schedulerRegistry.getCronJob(CRON_S3_UPLOADER);
    job.stop();

    try {
      await this.process(job);
    } catch (err) {
      this.logger.error('PROCESS FAILED', err);
    }

    this.logger.log(
      '==== SCHEDULER END : Process ==== api v' + appJSON.version,
    );
    job.start();
  }

  async init() {
    this.clientApp = new S3Client({
      region: 'sgp1',
      credentials: {
        accessKeyId: process.env.STORAGE_KEY_ID,
        secretAccessKey: process.env.STORAGE_ACCESS_KEY,
      },
    });
  }

  async process(job: CronJob) {
    try {
      const params = {
        ACL: ObjectCannedACL.public_read,
        Bucket: process.env.STORAGE_BUCKET,
        Body: '',
        Key: '',
      };
      const command = new PutObjectAclCommand(params);
      const res = await this.clientApp.send(command);
      this.logger.log('result', res);
    } catch (error) {
      // error handling.
    } finally {
      // finally.
    }
  }

  async uploadToS3() {
    this.clientApp.download(
      process.env.FTP_REMOTE_DIR,
      process.env.DOWNLOADED_DIR,
      result => {
        this.logger.log('download result', result);
      },
    );
  }
}
