import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ScheduleModule } from '@nestjs/schedule';
import { FTPDownloaderSchedulerService } from './f3Downloader.service';
import { FTPTOS3Model } from './ftp_to_s3.entity';
import { FTPDownloaderController } from './ftpDownloader.controller';
import { S3UploaderController } from './s3Uploader.controller';
import { S3Service } from './s3.service';

@Module({
  imports: [
    SequelizeModule.forFeature(
      [
        FTPTOS3Model,
      ],
      // MAIN_DATABASE_CONNECTION,
    ),
    // SequelizeModule.forFeature([NotificationModel], SECONDARY_DATABASE_CONNECTION),
    ScheduleModule.forRoot(),
  ],
  providers: [FTPDownloaderSchedulerService, S3Service],
  controllers: [FTPDownloaderController, S3UploaderController],
  exports: [FTPDownloaderSchedulerService, S3Service],
})
export class FTPTOS3SchedulerModule {}
