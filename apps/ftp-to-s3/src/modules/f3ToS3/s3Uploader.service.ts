import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as appJSON from '../../../app.json';
import { CronJob } from 'cron';
import { S3Service } from './s3.service';
import * as fs from 'fs';

const CRON_S3_UPLOADER = 'CRON_S3_UPLOADER';

@Injectable()
export class S3UploaderSchedulerService {
  private readonly logger = new Logger(S3UploaderSchedulerService.name);
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private s3Service: S3Service,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS, { name: CRON_S3_UPLOADER })
  handleCron() {
    this.logger.debug('handleCronTryCatch');
    this.handleCronTryCatch();
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

  async process(job: CronJob) {
    const list = await fs.readdirSync(process.env.DOWNLOADED_DIR);
    this.logger.log('list', list);

    for (const fileName of list) {
      if (!fileName.includes('.')) {
        continue;
      }
      const key = process.env.STORAGE_DIRECTORY + '/' + fileName;
      this.logger.log('key', key);
      const localSrcFile = process.env.DOWNLOADED_DIR + '/' + fileName;

      const localDestDir = process.env.DOWNLOADED_DIR + '/uploaded';
      if (!fs.existsSync(localDestDir)) {
        fs.mkdirSync(localDestDir);
      }
      const localDestFile = localDestDir + '/' + fileName;

      try {
        const buffer = fs.readFileSync(localSrcFile);
        await this.s3Service.upload(buffer, key);
        fs.copyFileSync(localSrcFile, localDestFile);
        fs.unlinkSync(localSrcFile);
      } catch (err) {
        this.logger.error('ERROR localSrcFile: ' + localSrcFile);
        this.logger.error(err);
      }
    }
  }
}
