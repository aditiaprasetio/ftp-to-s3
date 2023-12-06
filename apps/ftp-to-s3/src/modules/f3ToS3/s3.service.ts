import { Injectable, Logger } from '@nestjs/common';
import { S3, Endpoint } from 'aws-sdk';

@Injectable()
export class S3Service {
  async upload(buffer: any, fileName: string) {
    const bucketS3 = process.env.STORAGE_BUCKET;

    await this.uploadS3(buffer, bucketS3, fileName);
  }

  async uploadS3(file, bucket, name) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  private getS3() {
    const spaceEndpoint = new Endpoint(process.env.STORAGE_ENDPOINT);
    return new S3({
      endpoint: spaceEndpoint,
      accessKeyId: process.env.STORAGE_KEY_ID,
      secretAccessKey: process.env.STORAGE_ACCESS_KEY,
    });
  }
}
