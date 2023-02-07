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
import {
	withErrorHandler
} from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { User, UserRoles } from '../models/user/user';

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

		/** POST create reservation for the future   */
		this.router.post(
			'/book',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse, next) => {

				const renter: User = await this.userManager.getUser(req.body.userId);

				const tour: Tour = await this.tourManager.getTour(req.body.tourId);

				const bpartner: BPartner = await this.bpartnerManager.getBP(req.body.bpartnerId);

				var points : PoiHelp[] = []
				if(tour!=null){
					for(var point of tour.points){
						var p : PoiHelp = new PoiHelp();
						p.id = point
						p.used = false

						points.push(p)
					}
				

				}
				
				// Create reservation
				const createdScheduledRent: Booking = await this.bookingManager.scheduleRent(
					renter,
					req.body.from,
					req.body.to,
					tour,
					bpartner,
					points
				);
				if (!createdScheduledRent) throw new CustomError(400, 'Cannot create rent!');
				return res.status(200).send(createdScheduledRent);
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
