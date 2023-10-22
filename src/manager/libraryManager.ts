import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
import { POI } from '../models/tours/poiModel';
import { PoiHelp } from '../models/booking/PoiHelp';
import { CustomError } from '../classes/customError';
import { BPartner } from '../models/bpartner/bpartner';
import { BPartnerManager } from './bpartnerManager';
import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { POIManager } from './poiManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { deserialize, serialize } from '../json';
import * as AWS from 'aws-sdk';

import libraryRepository, { LibraryRepository } from '../db/repository/libraryRepository';
import { Library } from '../models/library/library';

var QRCode = require('qrcode')


const s3bucket = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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",
	params: { Bucket: 'hopguides/qrcodes' }
});
export class LibraryManager {


	libraryRepository: LibraryRepository;
	
	constructor() {
		this.libraryRepository = libraryRepository;
	
	}



	async generateQr(url: string): Promise<string> {

		
			const qrCodeId = Date.now() + "-" + Math.floor(Math.random() * 1000);

			var opts = {
				margin: 1,
				color: {
					dark: "#010599FF",
					light: "#FFBF60FF"
				}
			}
			await QRCode.toDataURL(url, {
				scale: 15,
				width: "1000px",
			}, async function (err, base64) {
				const base64Data: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
				const type = base64.split(';')[0].split('/')[1];
				const params = {
					Bucket: 'hopguides/library',
					Key: `${qrCodeId}.png`, // type is not required
					Body: base64Data,
					ACL: 'public-read',
					ContentEncoding: 'base64', // required
					ContentType: `image/${type}` // required. Notice the back ticks
				}
				s3bucket.upload(params, function (err, data) {

					if (err) {
						console.log('ERROR MSG: ', err);
					} else {
						console.log('Successfully uploaded data');
						console.log(data);
					}
				});

			});

		
		return `https://hopguides.s3.eu-central-1.amazonaws.com/library/${qrCodeId}.png`

		//}
	}


	async create(library: Library): Promise<Library> {
		// search for user, check if it exists, if it does, check for the fields of confirmed and createdAt
		var lib:Library = await this.libraryRepository.createOne(library)

		return lib;
		
	}


	async getVideos(userId: string, pagination?: any): Promise<Library[]> {
		return await this.libraryRepository.getAll({ userId: userId }, pagination).catch(() => {
			throw new Error('Error getting Rents');
		});
	}

}