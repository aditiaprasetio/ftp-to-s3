import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as appJSON from '../../../app.json';
import { CronJob } from 'cron';
import { S3Service } from './s3.service';
import * as fs from 'fs';

const CRON_FILE_FIX_ISSUE = 'CRON_FILE_FIX_ISSUE';
const CRON_S3_UPLOADER = 'CRON_S3_UPLOADER';

@Injectable()
export class S3UploaderSchedulerService {
  private readonly logger = new Logger(S3UploaderSchedulerService.name);
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private s3Service: S3Service,
  ) {}

  @Cron(CronExpression.EVERY_SECOND, { name: CRON_FILE_FIX_ISSUE })
  handleCronFixFile() {
    if (process.env.RUN_SCHEDULER_FILE_FIXER === 'true') {
      this.logger.debug('handleCronFixFile');
      this.handleCronTryCatchFixFile();
    }
  }

  @Cron(CronExpression.EVERY_SECOND, { name: CRON_S3_UPLOADER })
  handleCron() {
    if (process.env.RUN_SCHEDULER_S3_UPLOADER === 'true') {
      this.logger.debug('handleCron');
      this.handleCronTryCatch();
    }
  }

  restartJob(job: CronJob) {
    this.logger.log('Job restarted');
    job.stop();
    job.start();
  }

  async handleCronTryCatchFixFile() {
    this.logger.log(
      '==== SCHEDULER START : Process ==== api v' + appJSON.version,
    );
    const job = this.schedulerRegistry.getCronJob(CRON_FILE_FIX_ISSUE);
    job.stop();

    try {
      await this.processFixFile(job);
    } catch (err) {
      this.logger.error('PROCESS FAILED', err);
    }

    this.logger.log(
      '==== SCHEDULER END : Process ==== api v' + appJSON.version,
    );
    job.start();
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

  // from uploaded to upper folder
  async processFixFile(job: CronJob) {
    const localDestDir = process.env.DOWNLOADED_DIR + '/uploaded';
    const list = fs.readdirSync(localDestDir);
    const countFiles = list.length;
    let remainingFiles = list.length;
    let totalProcessedFile = 0;
    let totalNotFile = 0;
    this.logger.log('processFixFile - total files: ' + countFiles);

    const willProcessList = list.filter((_, index) => index < 500);
    const countFilesCurrentProcess = willProcessList.length;
    let remainingFilesCurrentProcess = willProcessList.length;
    this.logger.log(
      'processFixFile - total files (will process): ' +
        remainingFilesCurrentProcess,
    );

    for (const idx in willProcessList) {
      let fileName = willProcessList[idx];
      if (!fileName.includes('.')) {
        totalNotFile++;
        continue;
      }

      if (!fileName.includes(',')) {
        totalNotFile++;
        continue;
      }

      let isWillProcess = false;
      const expPrefix = process.env.S3_UPLOADER_PREFIX ? process.env.S3_UPLOADER_PREFIX.split(',') : [];
      if (expPrefix.length === 0) {
        isWillProcess = true;
      } else {
        for (const prefix of expPrefix) {
          if (fileName.includes(prefix)) {
            isWillProcess = true;
          }
        }
      }
      if (!isWillProcess) {
        totalNotFile++;
        continue;
      }

      this.logger.log(
        `-> ${totalProcessedFile}/${remainingFilesCurrentProcess}/${countFiles}`,
      );

      totalProcessedFile++;

      if (!fs.existsSync(localDestDir)) {
        fs.mkdirSync(localDestDir);
      }
      const localDestFile = localDestDir + '/' + fileName;

      try {
        // rename file
        const newFileName = fileName.replace(/,/g, '-');
        const localSrcFile = process.env.DOWNLOADED_DIR + '/' + newFileName;
        fileName = newFileName;

        fs.copyFileSync(localDestFile, localSrcFile);
        fs.unlinkSync(localDestFile);

        remainingFiles--;
        remainingFilesCurrentProcess--;
        
        this.logger.log(
          'processFixFile - (CURRENT) Remaining: ' +
            remainingFilesCurrentProcess +
            ' ( ' +
            (
              (remainingFilesCurrentProcess / countFilesCurrentProcess) *
              100
            ).toFixed(2) +
            ' % )',
        );
        this.logger.log('processFixFile - (OVERALL) Remaining: ' + remainingFiles);
      } catch (err) {
        this.logger.error(
          'processFixFile - ERROR localDestFile: ' + localDestFile,
        );
        this.logger.error(err);
      }
    }
  }

  async process(job: CronJob) {
    const list = fs.readdirSync(process.env.DOWNLOADED_DIR);
    const countFiles = list.length;
    let remainingFiles = list.length;
    let totalProcessedFile = 0;
    let totalNotFile = 0;
    this.logger.log('total files: ' + countFiles);

    const willProcessList = list.filter((_, index) => index < 500);
    const countFilesCurrentProcess = willProcessList.length;
    let remainingFilesCurrentProcess = willProcessList.length;
    this.logger.log(
      'total files (will process): ' + remainingFilesCurrentProcess,
    );

    for (const idx in willProcessList) {
      let fileName = willProcessList[idx];
      const localSrcFile = process.env.DOWNLOADED_DIR + '/' + fileName;
      const localDestDir = process.env.DOWNLOADED_DIR + '/uploaded';
      if (!fileName.includes('.')) {
        totalNotFile++;
        continue;
      }
      
      let isWillProcess = false;
      const expPrefix = process.env.FILE_FIXER_PREFIX
        ? process.env.FILE_FIXER_PREFIX.split(',')
        : [];
      if (expPrefix.length === 0) {
        isWillProcess = true;
      } else {
        for (const prefix of expPrefix) {
          if (fileName.includes(prefix)) {
            isWillProcess = true;
          }
        }
      }
      if (!isWillProcess) {
        totalNotFile++;
        continue;
      }

      if (fileName.includes(',')) {
        // rename file
        const newFileName = fileName.replace(/,/g, '-');
        fs.renameSync(
          localSrcFile,
          process.env.DOWNLOADED_DIR + '/' + newFileName,
        );
        fileName = newFileName;
      }

      this.logger.log(
        `-> ${totalProcessedFile}/${remainingFilesCurrentProcess}/${countFiles}`,
      );

      totalProcessedFile++;
      const key = process.env.STORAGE_DIRECTORY + '/' + fileName;
      this.logger.log('key: ' + key);

      if (!fs.existsSync(localDestDir)) {
        fs.mkdirSync(localDestDir);
      }
      const localDestFile = localDestDir + '/' + fileName;

      try {
        const buffer = fs.readFileSync(localSrcFile);
        await this.s3Service.upload(buffer, key);
        fs.copyFileSync(localSrcFile, localDestFile);
        fs.unlinkSync(localSrcFile);
        remainingFiles--;
        remainingFilesCurrentProcess--;
        this.logger.log(
          '(CURRENT) Remaining: ' +
            remainingFilesCurrentProcess +
            ' ( ' +
            (
              (remainingFilesCurrentProcess / countFilesCurrentProcess) *
              100
            ).toFixed(2) +
            ' % )',
        );
        this.logger.log('(OVERALL) Remaining: ' + remainingFiles);
      } catch (err) {
        this.logger.error('ERROR localSrcFile: ' + localSrcFile);
        this.logger.error(err);
      }
    }
  }
}
