import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as appJSON from '../../../app.json';
import { CronJob } from 'cron';
import { S3Client, PutObjectAclCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { S3Service } from './s3.service';

const CRON_S3_UPLOADER = 'CRON_S3_UPLOADER';

@Injectable()
export class S3UploaderSchedulerService {
  private clientApp;
  private readonly logger = new Logger(S3UploaderSchedulerService.name);
  constructor(
    private schedulerRegistry: SchedulerRegistry,
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
    this.init();
    try {
      //
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
