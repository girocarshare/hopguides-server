import * as AWS from 'aws-sdk';
import { CustomError } from '../classes/customError';
import type { MulterFile } from '../classes/interfaces';
import { generateRandomHex } from './utils';

const AWS_ACCESS_KEY_ID = 'AKIATMWXSVRDMHOXYEUC';
const AWS_SECRET_ACCESS_KEY = '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';
const AWS_BUCKET_NAME = 'giromobility-dev';

export class S3Service {
  bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  async uploadICONFile(data: MulterFile): Promise<any> {
    const fileNameEnding = `.${data.originalname.split('.').pop()}`;
    const newFileName = `${Date.now().toString(16)}-${generateRandomHex(
      4,
    )}${fileNameEnding}`;
    const imgKey = `images/ICONS/${newFileName}`;

    const objectParams = {
      Bucket: this.bucketName,
      Key: imgKey,
      Body: data.buffer,
    };

    const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
      .putObject(objectParams)
      .promise();
    await uploadPromise.catch(() => {
      throw new CustomError(407, 'Upload to S3 error');
    });
    return `https://${this.bucketName}.imgix.net/${imgKey}`;
  }

  async uploadUserFile(userId: string, data: MulterFile): Promise<any> {
    const fileNameEnding = `.${data.originalname.split('.').pop()}`;
    const newFileName = `${Date.now().toString(16)}-${generateRandomHex(
      4,
    )}${fileNameEnding}`;
    const imgKey = `images/users/${userId}/${newFileName}`;

    const objectParams = {
      Bucket: this.bucketName,
      Key: imgKey,
      Body: data.buffer,
    };

    const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
      .putObject(objectParams)
      .promise();
    await uploadPromise.catch(() => {
      throw new CustomError(407, 'Upload to S3 error');
    });
    return `https://${this.bucketName}.imgix.net/${imgKey}`;
  }

  async uploadMenuFile(tourId: string, data: MulterFile): Promise<any> {
    const fileNameEnding = `.${data.originalname.split('.').pop()}`;
    const newFileName = `${Date.now().toString(16)}-${generateRandomHex(
      4,
    )}${fileNameEnding}`;
    const imgKey = `images/menu/${tourId}/${newFileName}`;

    const objectParams = {
      Bucket: 'Bucket',
      Key: imgKey,
      Body: data.buffer,
    };

    const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
      .putObject(objectParams)
      .promise();

    await uploadPromise.catch((err) => {
      throw new CustomError(407, 'Upload to S3 error');
    });

    return `https://${this.bucketName}.imgix.net/${imgKey}`;
  }

  async uploadReportFile(reportId: string, data: MulterFile): Promise<any> {
    const fileNameEnding = `.${data.originalname.split('.').pop()}`;
    const newFileName = `${Date.now().toString(16)}-${generateRandomHex(
      4,
    )}${fileNameEnding}`;
    const imgKey = `images/report/${reportId}/${newFileName}`;

    const objectParams = {
      Bucket: this.bucketName,
      Key: imgKey,
      Body: data.buffer,
    };

    const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
      .putObject(objectParams)
      .promise();
    await uploadPromise.catch(() => {
      throw new CustomError(407, 'Upload to S3 error');
    });
    return `https://${this.bucketName}.imgix.net/${imgKey}`;
  }
}
