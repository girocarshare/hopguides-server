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

		function getDistanceBetweenPoints(latitude1, longitude1, latitude2, longitude2) {
			let theta = longitude1 - longitude2;
			let distance = 60 * 1.1515 * (180 / Math.PI) * Math.acos(
				Math.sin(latitude1 * (Math.PI / 180)) * Math.sin(latitude2 * (Math.PI / 180)) +
				Math.cos(latitude1 * (Math.PI / 180)) * Math.cos(latitude2 * (Math.PI / 180)) * Math.cos(theta * (Math.PI / 180))
			);

			return distance * 1.609344;

		}

		/** POST create reservation for the future */
		this.router.post(
			'/book',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse, next) => {


				const tour: Tour = await this.tourManager.getTour(req.body.tourId);

				const logitude: string = req.body.longitude;
				const latitude: string = req.body.latitude;

				const bpartner: BPartner = await this.bpartnerManager.getBP(req.body.bpartnerId);

				const logitudePartner: string = bpartner.contact.location.longitude;
				const latitudePartner: string = bpartner.contact.location.latitude;


				var distance = getDistanceBetweenPoints(latitude, logitude, latitudePartner, logitudePartner)

				if (distance > 0.5) {

					var points: PoiHelp[] = []
					if (tour != null) {
						for (var point of tour.points) {
							var p: PoiHelp = new PoiHelp();
							p.id = point
							p.used = false

							const image_name = Date.now() + "-" + Math.floor(Math.random() * 1000);
							QRCode.toDataURL("http://localhost:3000/deeplink",{scale: 15,
							width: "1000px"}, function (err, base64) {
								
								const base64Data : Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
								const type = base64.split(';')[0].split('/')[1];
								const params = {
									Bucket: 'hopguides/qrcodes',
									Key: `${image_name}.${type}`, // type is not required
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
									}
								});
							});

							/*await QRCode.toFile('images/qrcodes/' + point.trim() + "---" + tour.id.trim() + ".png", "http://localhost:3000/deeplink", {
								scale: 15,
								width: "1000px"
							}, function (err) {
								if (err) throw err
								console.log('done')
							})*/



							p.qrCode = 'https://hopguides.s3.eu-central-1.amazonaws.com/gqcodes/'+image_name+".png"

							points.push(p)
						}


					}
					// Create reservation
					const createdScheduledRent: Booking = await this.bookingManager.scheduleRent(
						req.body.from,
						req.body.to,
						tour,
						bpartner,
						points
					);
					if (!createdScheduledRent) throw new CustomError(400, 'Cannot create rent!');
					return res.status(200).send(createdScheduledRent);

				}
				else {
					return res.status(412).send("You're not in the range of starting point");
				}


			})
		);

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

		}
}
