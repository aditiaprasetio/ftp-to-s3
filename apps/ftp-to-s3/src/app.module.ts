import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { FTPTOS3SchedulerModule } from './modules/f3ToS3/ftp_to_s3.module';
import { FTPTOS3Model } from './modules/f3ToS3/ftp_to_s3.entity';

export const rootImportedModules = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: process.env.ENV_PATH,
  }),
  SequelizeModule.forRoot({
    synchronize: true,
    // name: MAIN_DATABASE_CONNECTION,
    username: process.env.DB_USER || 'test',
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || 'test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'postgres',
    autoLoadModels: false,
    ssl: process.env.DB_SSL === 'true',
    logging: true,
    models: [FTPTOS3Model],
    dialectOptions: {
      allowPublicKeyRetrieval: true,
    },
    timezone: 'Asia/Jakarta',
  }),
  // SequelizeModule.forRoot({
  //   // synchronize: process.env.NODE_ENV === 'local' ? true : false,
  //   synchronize: false,
  //   name: BCA_CONNECTION,
  //   username: process.env.DB_USER_BCA || 'qbit',
  //   password: process.env.DB_PASS_BCA || null,
  //   database: process.env.DB_NAME_BCA || 'testing',
  //   host: process.env.DB_HOST_BCA || 'localhost',
  //   port: parseInt(process.env.DB_PORT_BCA || '3306'),
  //   dialect: 'postgres',
  //   ssl: false,
  //   autoLoadModels: false,
  //   logging: true,
  //   models: [NotificationModel],
  //   dialectOptions: {
  //     allowPublicKeyRetrieval: true,
  //   },
  //   timezone: 'Asia/Jakarta',
  // }),
];

@Module({
  imports: [...rootImportedModules, FTPTOS3SchedulerModule],
  controllers: [AppController],
})
export class AppModule {}
