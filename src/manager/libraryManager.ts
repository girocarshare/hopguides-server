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
import { MongoRepository } from '../db/repository/mongoRepository';
import axios from 'axios';
import { QRCodes } from '../models/qrcodes/qrcodes';
import libraryRepository, { LibraryRepository } from '../db/repository/libraryRepository';
import qrcodesRepository, { QrcodesRepository } from '../db/repository/qrcodesRepository';
import scrapedRepository, { ScrapedRepository } from '../db/repository/scrapedRepository';
import { Library } from '../models/library/library';

import * as fs from 'fs';
import { Scraped } from '../models/qrcodes/scraped';
var QRCode = require('qrcode')


const s3bucket = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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",
	params: { Bucket: 'hopguides/qrcodes' }
});
export class LibraryManager {


	libraryRepository: LibraryRepository;
	qrcodesRepository: QrcodesRepository;
	scrapedRepository: ScrapedRepository;

	constructor() {
		this.libraryRepository = libraryRepository;
		this.qrcodesRepository = qrcodesRepository;
		this.scrapedRepository = scrapedRepository;

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

	async generateQr1(url: string, link: string, text: string, campaign: string): Promise<string> {


		const codee = Math.floor(100000000 + Math.random() * 900000000)
		const qrCodeId = Date.now() + "-" + Math.floor(Math.random() * 1000);

		var opts = {
			margin: 1,
			color: {
				dark: "#010599FF",
				light: "#FFBF60FF"
			}
		}
		await QRCode.toDataURL("https://hopguides-video-creation.netlify.app/#/videowithlink/" + codee + `/redirect?firstUrl=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, {
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


		var qrcode: QRCodes = new QRCodes();
		qrcode.qrcode = `https://hopguides.s3.eu-central-1.amazonaws.com/library/${qrCodeId}.png`
		qrcode.code = codee;
		qrcode.qrCodeId = qrCodeId
		qrcode.video = url;
		qrcode.text = text;
		qrcode.link = link;
		qrcode.campaign = campaign;
		qrcode.forVideo = true;


		var code = await this.qrcodesRepository.createOne(qrcode).catch(() => {
			throw new CustomError(500, 'QRCode not created!');
		});



		return `https://hopguides.s3.eu-central-1.amazonaws.com/library/${qrCodeId}.png`

		//}
	}

	async getAllQrCodes(): Promise<QRCodes[]> {
		try {
			const filter = { forVideo: true };
			// Directly query for QR codes where 'forVideo' is true
			var qr: QRCodes[] = await this.qrcodesRepository.getAll({
				forVideo: true
			});
			return qr;
		} catch (err) {
			throw new Error('Error getting QR codes: ' + err.message);
		}
	}


	
	async getAllScrapes(): Promise<Scraped[]> {
		try {
			// Directly query for QR codes where 'forVideo' is true
			var qr: Scraped[] = await this.scrapedRepository.getAll();
			console.log(qr)
			return qr;
		} catch (err) {
			throw new Error('Error getting QR codes: ' + err.message);
		}
	}

	

	async updateScraped(name: string, email: string, website: string, id: string, text: string): Promise<Scraped> {
		try {
			// Directly query for QR codes where 'forVideo' is true
			var sc: Scraped = await this.scrapedRepository.getByObjectIdOrThrow(id);

			console.log("NASLAAAAAAA")
			console.log(sc)
			sc.hotel = name;
			sc.email = email;
			sc.website = website

			/*if (text != "") {
				sc.text += text;
			}*/
			console.log(sc)

			var qrupdated: Scraped= await this.scrapedRepository.updateOneObjectId(id, sc);

			return qrupdated;
		} catch (err) {
			console.log(err.error.errors)
		}
	}

	async getGqCodeFromCode(code: number): Promise<QRCodes> {
		try {
			// Directly query for QR codes where 'forVideo' is true
			
			var qr: QRCodes = await this.qrcodesRepository.findOne({
				code: code
			});
			return qr;
		} catch (err) {
			throw new Error('Error getting QR codes: ' + err.message);
		}
	}

	async updateQrCode(url: string, link: string, text: string, id: string, campaign: string): Promise<QRCodes> {
		try {
			// Directly query for QR codes where 'forVideo' is true
			var qr: QRCodes = await this.qrcodesRepository.getByIdOrThrow(id);

			qr.link = link;
			qr.text = text;
			qr.campaign = campaign

			if (url != "") {
				qr.video = url;
			}
			console.log(qr)

			var qrupdated: QRCodes = await this.qrcodesRepository.updateOne(id, qr);

			return qrupdated;
		} catch (err) {
			throw new Error('Error getting QR codes: ' + err.message);
		}
	}


	async saveGeneratedVideoURL(url: string): Promise<string> {
		const videoName = Date.now() + "-" + Math.floor(Math.random() * 1000);
		const response = await axios({
			method: 'get',
			url: url,
			responseType: 'stream'
		});

		// Create the S3 upload parameters
		const params = {
			Bucket: 'hopguides/library',
			Key: `${videoName}.mp4`,
			Body: response.data,
			ACL: 'public-read',
			ContentType: 'video/mp4',
		};

		// Upload the video stream to S3
		await new Promise((resolve, reject) => {
			s3bucket.upload(params, (err, data) => {
				if (err) {
					console.log('ERROR MSG: ', err);
					reject(err);
				} else {
					console.log('Successfully uploaded data');
					console.log(data);
					resolve(`https://hopguides.s3.eu-central-1.amazonaws.com/library/${videoName}.mp4`);
				}
			});
		});

		return `https://hopguides.s3.eu-central-1.amazonaws.com/library/${videoName}.mp4`
	}



	async saveGeneratedVideo(url: string): Promise<string> {
		const videoName = Date.now() + "-" + Math.floor(Math.random() * 1000);

		// Fetch the video stream from the URL
		const fileStream = fs.createReadStream(url);
		// Create the S3 upload parameters
		const params = {
			Bucket: 'hopguides/library',
			Key: `${videoName}.mp4`,
			Body: fileStream,
			ACL: 'public-read',
			ContentType: 'video/mp4',
		};

		// Upload the video stream to S3
		await new Promise((resolve, reject) => {
			s3bucket.upload(params, (err, data) => {
				if (err) {
					console.log('ERROR MSG: ', err);
					reject(err);
				} else {
					console.log('Successfully uploaded data');
					console.log(data);
					resolve(`https://hopguides.s3.eu-central-1.amazonaws.com/library/${videoName}.mp4`);
				}
			});
		});

		return `https://hopguides.s3.eu-central-1.amazonaws.com/library/${videoName}.mp4`
	}




	async create(library: Library): Promise<Library> {
		// search for user, check if it exists, if it does, check for the fields of confirmed and createdAt
		var lib: Library = await this.libraryRepository.createOne(library)

		return lib;

	}


	async getVideos(userId: string, pagination?: any): Promise<Library[]> {
		return await this.libraryRepository.getAll({ userId: userId }, pagination).catch(() => {
			throw new Error('Error getting Rents');
		});
	}

}