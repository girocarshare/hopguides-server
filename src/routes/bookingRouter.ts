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

							await QRCode.toFile('images/qrcodes/' + point.trim() + "---" + tour.id.trim() + ".png", "http://localhost:3000/deeplink", {
								scale: 15,
								width: "1000px"
							}, function (err) {
								if (err) throw err
								console.log('done')
							})



							p.qrCode = 'images/qrcodes/' + point.trim() + "*" + tour.id.trim() + ".png"

							points.push(p)
						}


					}
					console.log(Date.now())
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
