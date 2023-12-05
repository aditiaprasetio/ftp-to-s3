import { Controller, Get, HttpException, Logger, Param } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { getErrorStatusCode } from 'libs/utils/error';
import { CRON_FTP_DOWNLOADER, ftpClient } from '../../core/ftpClient';

@ApiTags('FTP')
@Controller('ftp')
export class FTPDownloaderController {
  private readonly logger = new Logger(FTPDownloaderController.name);
  constructor(private schedulerRegistry: SchedulerRegistry) {
    //
  }

  @Get()
  async closeConnection(): Promise<{ isSuccess: boolean }> {
    try {
      ftpClient.close();

      const job = this.schedulerRegistry.getCronJob(CRON_FTP_DOWNLOADER);
      job.start();

      return { isSuccess: true };
    } catch (err) {
      throw new HttpException(err, getErrorStatusCode(err));
    }
  }
}
