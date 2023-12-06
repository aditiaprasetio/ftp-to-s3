import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ScheduleModule } from '@nestjs/schedule';
import { FTPTOS3Model } from './ftp_to_s3.entity';
import { FTPDownloaderController } from './ftpDownloader.controller';
import { S3UploaderController } from './s3Uploader.controller';
import { S3Service } from './s3.service';
import { S3UploaderSchedulerService } from './s3Uploader.service';

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
  providers: [S3Service, S3UploaderSchedulerService],
  controllers: [FTPDownloaderController, S3UploaderController],
  exports: [S3Service, S3UploaderSchedulerService],
})
export class FTPTOS3SchedulerModule {}
