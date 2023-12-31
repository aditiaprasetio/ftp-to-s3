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
    const uploadedDir = process.env.DOWNLOADED_DIR + '/uploaded';
    const list = fs.readdirSync(uploadedDir);
    const countFiles = list.length;
    let remainingFiles = list.length;
    let totalProcessedFile = 0;
    let totalNotFile = 0;
    this.logger.log('processFixFile - total files: ' + countFiles);

    const willProcessList = list.filter((itemName, index) =>
      this.isWillProcess(itemName, process.env.FILE_FIXER_PREFIX) && itemName.includes(','),
    );
    const countFilesCurrentProcess = willProcessList.length;
    let remainingFilesCurrentProcess = willProcessList.length;
    this.logger.log(
      'processFixFile - total files (will process): ' +
        remainingFilesCurrentProcess,
    );

    for (const idx in willProcessList) {
      let fileName = willProcessList[idx];
      console.info('fileName', fileName);

      this.logger.log(
        `-> ${totalProcessedFile}/${remainingFilesCurrentProcess}/${countFiles}`,
      );

      totalProcessedFile++;

      if (!fs.existsSync(uploadedDir)) {
        fs.mkdirSync(uploadedDir);
      }
      const fromUploadedFolderFile = uploadedDir + '/' + fileName;

      try {
        // rename file
        const newFileName = fileName.replace(/,/g, '-').replace(/\+/g, '-');
        const fromBaseGeniusFolderFile =
          process.env.DOWNLOADED_DIR + '/' + newFileName;
        fileName = newFileName;

        fs.copyFileSync(fromUploadedFolderFile, fromBaseGeniusFolderFile);
        fs.unlinkSync(fromUploadedFolderFile);

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
        this.logger.log(
          'processFixFile - (OVERALL) Remaining: ' + remainingFiles,
        );
      } catch (err) {
        this.logger.error('processFixFile - ERROR uploadedDir: ' + uploadedDir);
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

    // const willProcessList = list.filter((_, index) => index < 500);
    const willProcessList = list.filter((itemName, index) =>
      this.isWillProcess(itemName, process.env.S3_UPLOADER_PREFIX),
    );

    const countFilesCurrentProcess = willProcessList.length;
    let remainingFilesCurrentProcess = willProcessList.length;
    this.logger.log(
      'total files (will process): ' + remainingFilesCurrentProcess,
    );

    for (const idx in willProcessList) {
      let fileName = willProcessList[idx];
      let localSrcFile = process.env.DOWNLOADED_DIR + '/' + fileName;
      const localDestDir = process.env.DOWNLOADED_DIR + '/uploaded';

      if (fileName.includes(',')) {
        // rename file
        const newFileName = fileName.replace(/,/g, '-');
        fs.renameSync(
          localSrcFile,
          process.env.DOWNLOADED_DIR + '/' + newFileName,
        );
        fileName = newFileName;
        localSrcFile = process.env.DOWNLOADED_DIR + '/' + fileName;
      }
      if (fileName.includes('+')) {
        // rename file
        const newFileName = fileName.replace(/\+/g, '-');
        fs.renameSync(
          localSrcFile,
          process.env.DOWNLOADED_DIR + '/' + newFileName,
        );
        fileName = newFileName;
        localSrcFile = process.env.DOWNLOADED_DIR + '/' + fileName;
      }

      this.logger.log(
        `-> ${totalProcessedFile}/${remainingFilesCurrentProcess}/${countFilesCurrentProcess}`,
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

  isWillProcess(fileName: string, prefixWillProcess: string) {
    if (!fileName.includes('.')) {
      return false;
    }

    let isWillBeProcessssss = false;
    const expPrefix = prefixWillProcess
      ? prefixWillProcess.split(',')
      : [];
    if (expPrefix.length === 0) {
      isWillBeProcessssss = true;
    } else {
      for (const prefix of expPrefix) {
        if (fileName.includes(prefix)) {
          isWillBeProcessssss = true;
        }
      }
    }
    if (!isWillBeProcessssss) {
      return false;
    }

    return true;
  }
}
