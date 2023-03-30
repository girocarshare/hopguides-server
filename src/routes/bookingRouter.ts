import { CustomError } from '../classes/customError';
import { IRequest, IResponse } from '../classes/interfaces';
import { BookingManager } from '../manager/bookingManager';
import { UserManager } from '../manager/userManager';
import { TourManager } from '../manager/tourManager';
import { POIManager } from '../manager/poiManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { Tour } from '../models/tours/tour';
import { PoiHelp } from '../models/booking/PoiHelp';
import { BPartner } from '../models/bpartner/bpartner';

var deeplink = require('node-deeplink');
import {
	withErrorHandler
} from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { User, UserRoles } from '../models/user/user';
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
export class BookingRouter extends BaseRouter {
	bookingManager = new BookingManager();
	userManager = new UserManager();
	tourManager = new TourManager();
	bpartnerManager = new BPartnerManager();
	poiManager = new POIManager();
	upload: any;

	constructor() {
		super();
		this.init();
	}

	init(): void {

		/** GET all bookings   */
		this.router.get(
			'/all',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const filter: any = {};

				const bookings: Booking[] = await this.bookingManager.getBookings(filter);
				return res.status(200).send(bookings);
			})
		);

		/** Finish tour/booking   */
		this.router.get(
			'/endBooking/:bookingId',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {


				await this.bookingManager.endBooking(req.params.bookingId);
				return res.status(200).send("Success");
			})
		);
		}
}
