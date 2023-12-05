import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ScheduleModule } from '@nestjs/schedule';
import { FTPTOS3SchedulerService } from './f3Downloader.service';
import { FTPTOS3Model } from './ftp_to_s3.entity';

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
  providers: [FTPTOS3SchedulerService],
  controllers: [],
  exports: [FTPTOS3SchedulerService],
})
export class FTPTOS3SchedulerModule {}
