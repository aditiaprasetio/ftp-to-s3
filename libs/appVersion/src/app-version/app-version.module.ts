import { Module } from '@nestjs/common';
import { AppVersionService } from './app-version.service';
import { AppVersionController } from './app-version.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppVersionModel } from './app-version.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AppVersionModel
    ]),
  ],
  providers: [AppVersionService],
  controllers: [AppVersionController],
  exports: [AppVersionService],
})

export class AppVersionModule { }