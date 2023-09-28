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
var multerS3 = require('multer-s3');
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})

const s3bucket = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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",
	params: {Bucket: 'hopguides/qrcodes'}});
var QRCode = require('qrcode')
interface helpObjectSort {
	from: string;
	count: number;
  };

export class CityManager {


	constructor() {
		

	}


}