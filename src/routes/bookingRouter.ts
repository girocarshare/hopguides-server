import { CustomError } from '../classes/customError';
import { IRequest, IResponse } from '../classes/interfaces';
/*import { SearchRentFilter } from '../classes/searchBookingFilter';
import { SearchPagination } from '../classes/searchPagination';
import { deserialize, serialize } from '../json';*/
import { BookingManager } from '../manager/bookingManager';
import { UserManager } from '../manager/userManager';
import { Booking, RentStatus } from '../models/booking/booking';
import {
	/*AdminRole,
	allowFor,
	ManagerRole,
	maskUserData,
	parseJwt,
	SupportRole,*/
	withErrorHandler
} from '../utils/utils';
import { BaseRouter } from './baseRouter';
//import * as multer from 'multer';
import { User, UserRoles } from '../models/user/user';
/*import { NotificationManager } from '../manager/notificationManager';
import { Vehicle } from '../models/car/car';
import { SettingsManager } from '../manager/settingsManager';
import { UserBasicPayload } from '../classes/user/userBasicPayload';
import { VehicleAvailable } from '../models/car/enums';*/

export class BookingRouter extends BaseRouter {
	//settingsManager: SettingsManager = new SettingsManager();
	bookingManager = new BookingManager();
	userManager = new UserManager();
	//notificationManager = new NotificationManager();

	upload: any;

	constructor() {
		super();
		//this.upload = multer();
		this.init();
	}

	init(): void {

		/** POST create reservation for the future   */
		this.router.post(
			'/book',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse, next) => {
				// Extract body
				const { purpose, phone, scheduledFrom, scheduledTo } = req.body;
				// Extract vehicle
				//const vehicle: Vehicle = await this.carManager.getVehicle(req.params.vehicleId);
				//if (!vehicle) {
				//	throw new CustomError(412, 'Vehicle not found');
				//}
				// if (moment().diff(scheduledFrom, 'minutes') > 5) {
				// 	throw new CustomError(412, 'Cannot schedule so before right now!');
				// }

				// todo : maybe cache those settings, or better: create a caching layer in `settingsManager`

				const renter: User = await this.userManager.getUserByPhone(phone);

	///////////////////////////////////////*			if (!renter.hasPaymentMethod() && renter.getAccountBalance() > 0) {
					//throw new CustomError(413, 'Please input payment method first');
				//}******************************************************************************************
				// const LOW_BALANCE: number = await this.settingsManager.getSettingVal(
				// 	SettingType.LOW_BALANCE_M
				// );
				// if (renter.getAccountBalance() < LOW_BALANCE) {
				// 	// Check for AUTORELOAD
				// 	if (renter.autoTopUp) {
				// 		/** We must autoreload cash if it goes below LOW_BALANCE   
				// 		const updatedUser: User = await this.userManager.autoTopUp(renter, req.ip);
				// 		if (renter.getAccountBalance() <= updatedUser.getAccountBalance()) {
				// 			throw new CustomError(413, 'Balance is too low to rent!');
				// 		}
				// 	} else {
				// 		throw new CustomError(413, 'Balance is too low to rent!');
				// 	}
				// }

				// User can ride only one scooter at a time
				// if ((await this.bookingManager.__countUserActiveBookings(renter.id)) > 0) {
				// 	throw new CustomError(
				// 		411,
				// 		'You cannot group rent right now, but we are working on it!'
				// 	);
				// }

				// Create reservation
				const createdScheduledRent: Booking = await this.bookingManager.scheduleRent(
					//vehicle,
					renter,
					scheduledFrom,
					scheduledTo,
					//purpose
				);
				if (!createdScheduledRent) throw new CustomError(400, 'Cannot create rent!');
				return res.status(200).send(createdScheduledRent);
			})
		);



		/** GET bookings with user details   
		this.router.get(
			'/',
			allowFor([AdminRole, ManagerRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const pagination: SearchPagination = new SearchPagination(req.query);
				const user: User = await this.userManager.getUser(req.userId);
				const filter: SearchRentFilter = SearchRentFilter.build(req.query, user);
				const bookings: Booking[] = await this.bookingManager.getBookings(
					filter,
					pagination
				);

				for (const rent of bookings) {
					rent.renter = deserialize(
						UserBasicPayload,
						await this.userManager.getRenter(rent.userId)
					);
				}
				return res.respond(
					200,
					bookings.map(b => serialize(b))
				);
			})
		);

		/** GET count of all bookings   
		this.router.get(
			'/count',
			allowFor([AdminRole, ManagerRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const user: User = await this.userManager.getUser(req.userId);
				const filter: any = {};
				if (user.roleMB === UserRoles.MANAGER) {
					filter['vehicle.maintainedBy.managers'] = user.id;
				}
				const count: number = await this.bookingManager.count(filter);
				return res.respond(200, count);
			})
		);

		/** GET fetches the booking by bookingId   
		this.router.get(
			'/:bookingId',
			allowFor([AdminRole, ManagerRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const booking: Booking = await this.bookingManager.getBooking(req.params.bookingId);
				booking.renter = deserialize(
					UserBasicPayload,
					await this.userManager.getUser(booking.userId)
				);

				return res.respond(200, serialize(maskUserData([booking], req?.user?.roleMB)[0]));
			})
		);

		/**
		 * POST upload file parking at the end of the ride
		   
		// todo : with this configuration we are filling up the tmp folder of the system
		this.router.post(
			'/:bookingId/uploadFile',
			allowFor([AdminRole, ManagerRole, SupportRole]),
			parseJwt,
			this.upload.single('file'),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				// todo : here any user can upload the picture to any booking
				//        whatever role it has, and whoever the booking is of
				const booking: Booking = await this.bookingManager.getBooking(req.params.bookingId);
				if (!booking) return res.throwErr(new CustomError(400, 'No booking found'));
				// todo : enyone can upload a picture to a booking, even if it is ended
				if (!req.file) return res.throwErr(new CustomError(400, 'No file found'));
				// const photoURL: string = await this.bookingManager.uploadFile(booking.id, file);
				// // todo : why this logic is not part of the bookingManager.uploadFile ??
				// const updateData: Booking = {} as any;
				// updateData.returnImage = photoURL;
				// updateData.returnImages = [];
				// updateData.returnImages.push(photoURL);
				const updatedBooking: Booking = await this.bookingManager.__uploadFile(
					booking.id,
					req.file
				);
				return res.respond(200, updatedBooking);
			})
		);

		/**
		 * POST refund the rent
		   
		this.router.post(
			'/:bookingId/refund',
			allowFor([AdminRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const booking: Booking = await this.bookingManager.getBooking(req.params.bookingId);
				if (!booking) return res.throwErr(new CustomError(404, 'No booking found'));

				const updatedBooking: Booking = await this.bookingManager.refundBooking(
					req.userId,
					booking,
					req.ip
				);

				return res.respond(200, updatedBooking);
			})
		);

	

		this.router.patch(
			'/:scheduleId/schedule',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const { purpose, tourId, phone, scheduledFrom, scheduledTo } = req.body;
				const schedule: Booking = await this.bookingManager.getBooking(
					req.params.scheduleId
				);
				const renter: User = await this.userManager.getUserByPhone(phone);
				const tour: Tour = await this.tourManager.getTour(tourId);

				const updatedBooking: Booking = await this.bookingManager.updateBooking(
					schedule.id,
					{
						travelPurpose: purpose,
						userId: renter.id,
						vehicle: vehicle,
						from: scheduledFrom,
						to: scheduledTo
					}
				);
				return res.respond(200, updatedBooking);
			})
		);

		this.router.delete(
			'/:scheduleId/schedule',
			allowFor([AdminRole, ManagerRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const deletedRent: boolean = await this.bookingManager.deleteRent(
					req.params.scheduleId
				);
				return res.respond(200, !!deletedRent);
			})
		);

		/**
		 * POST manual end rent
		   
		this.router.post(
			'/:bookingId/manualEnd',
			allowFor([AdminRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const booking: Booking = await this.bookingManager.getBooking(req.params.bookingId);
				if (!booking) return res.throwErr(new CustomError(404, 'No booking found'));

				const vehicle: Vehicle = await this.carManager.getVehicleByIMEI(
					booking?.vehicle?.IMEI.substring(1)
				);

				await this.carManager.updateVehicle(vehicle.id, {
					available: VehicleAvailable.ONLINE
				});

				const updatedBooking: Booking = await this.bookingManager.updateBooking(
					booking.id,
					{
						status: RentStatus.FINISHED,
						to: booking.from + booking?.payment?.time * 3600000 || 0,
						endPrice: booking?.payment?.price || 0,
						endTime: booking?.payment?.time * 60 || 0
					}
				);

				return res.respond(200, updatedBooking);
			})
		);



		/** POST Validate foodie tour voucher from validator web app   
		this.router.post(
			'/:voucherCode/:userId/validateVoucher',
			// parseJwt, //TO DO
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const userId = req.params.userId;
				const voucherCode = req.params.voucherCode;
				// LOGGER.debug("User ID: " + userId + ", Voucher Code: " + voucherCode);
				var voucherValidation: boolean = false;
				const bookings: Booking[] = await this.bookingManager.__getActiveBookingsFor(
					userId
				);
				for (const booking of bookings) {
					var generatedVouchers = booking.generatedVouchers
					generatedVouchers.forEach(voucher => {
						if (voucher.voucherCode === voucherCode) {
							if (!voucher.voucherUsed) {
								const updateData: Booking = booking;
								voucher.voucherUsed = true;
								updateData['generatedVouchers'] = generatedVouchers;
								this.bookingManager.updateBooking(booking.id, updateData);
								voucherValidation = true;
							}
							return;
						}
					});
				}
				return res.respond(200, voucherValidation);
			})
		);*/
	}
}
