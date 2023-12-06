import { Controller, Get, HttpException, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import { getErrorStatusCode } from 'libs/utils/error';
import { S3Service } from './s3.service';

@ApiTags('S3')
@Controller('s3')
export class S3UploaderController {
  private readonly logger = new Logger(S3UploaderController.name);
  constructor(
    private s3Service: S3Service,
  ) {
    //
  }

  @Get('upload')
  async upload() {
    try {
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
        } catch(err) {
          this.logger.error('ERROR localSrcFile: ' + localSrcFile);
          this.logger.error(err);
        }
      }
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(err, getErrorStatusCode(err));
    }
  }
}
