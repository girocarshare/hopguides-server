import * as AWS from 'aws-sdk';
import { CustomError } from '../classes/customError';
import { MulterFile } from '../classes/interfaces';
import { generateRandomHex } from './utils';

var AWS_ACCESS_KEY_ID="AKIATMWXSVRDMHOXYEUC"
var AWS_SECRET_ACCESS_KEY= "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"
var AWS_BUCKET_NAME= "giromobility-dev"

export class S3Service {
	bucketName: string;

	constructor(bucketName: string) {
		this.bucketName = bucketName;
	}

	async uploadICONFile(data: MulterFile): Promise<any> {
		const fileNameEnding: string = '.' + data.originalname.split('.').pop();
		const newFileName: string =
			Date.now().toString(16) + '-' + generateRandomHex(4) + fileNameEnding;
		const imgKey: string = `images/ICONS/${newFileName}`;

		const objectParams = {
			Bucket: this.bucketName,
			Key: imgKey,
			Body: data.buffer
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
		const fileNameEnding: string = '.' + data.originalname.split('.').pop();
		const newFileName: string =
			Date.now().toString(16) + '-' + generateRandomHex(4) + fileNameEnding;
		const imgKey: string = `images/users/${userId}/${newFileName}`;

		const objectParams = {
			Bucket: this.bucketName,
			Key: imgKey,
			Body: data.buffer
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
		
		const fileNameEnding: string = '.' + data.originalname.split('.').pop();
		const newFileName: string =
			Date.now().toString(16) + '-' + generateRandomHex(4) + fileNameEnding;
		const imgKey: string = `images/menu/${tourId}/${newFileName}`;

		const objectParams = {
			Bucket: "Bucket",
			Key: imgKey,
			Body: data.buffer
		};

		const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
			.putObject(objectParams)
			.promise();
			
		await uploadPromise.catch((err) => {
			console.log("allala" + err)
			throw new CustomError(407, 'Upload to S3 error');
		});
		
		console.log("evo mee 5")
		return `https://${this.bucketName}.imgix.net/${imgKey}`;
	}

	async uploadReportFile(reportId: string, data: MulterFile): Promise<any> {
		const fileNameEnding: string = '.' + data.originalname.split('.').pop();
		const newFileName: string =
			Date.now().toString(16) + '-' + generateRandomHex(4) + fileNameEnding;
		const imgKey: string = `images/report/${reportId}/${newFileName}`;

		const objectParams = {
			Bucket: this.bucketName,
			Key: imgKey,
			Body: data.buffer
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
