import { PaymentType, RentEndReason, RentType } from './../models/booking/booking';
import BookingRepo, { BookingRepository } from '../db/repository/bookingRepository';
//import { CarManager } from './carManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { User } from '../models/user/user';
import { Tour } from '../models/tours/tour';
import { BPartner } from '../models/bpartner/bpartner';
/*import { CreateBookingReviewPayload } from '../classes/review/createBookingReviewPayload';
import { CustomError } from '../classes/customError';
import { S3Service } from '../utils/s3Service';
import { UserManager } from './userManager';
import { Transaction, TransactionType } from '../models/transaction';
import { deserialize } from '../json';
import { Review } from '../models/reviewRideOrBooking';
import { MulterFile } from '../classes/interfaces';
import { LockStatus, PowerDirection, PricingType, VehicleAvailable } from '../models/car/enums';
import { roundToTwoDecimal } from '../utils/utils';
import { TransactionManager } from './transactionManager';
import * as moment from 'moment';
import { BookingVehicle, StateInfo, VehicleRentState } from '../models/booking/bookingVehicle';
import { GeoLocation } from '../models/address/geoLocation';*/
import { Logger } from 'tslog';

export class BookingManager {
	bookingRepository: BookingRepository;
	/*carManager: CarManager;
	userManager: UserManager;
	transactionManager: TransactionManager;
	s3Service: S3Service;*/
	logger: Logger = new Logger();

	constructor() {
		this.bookingRepository = BookingRepo;
		/*this.transactionManager = new TransactionManager();
		this.userManager = new UserManager();
		this.carManager = new CarManager();
		this.s3Service = new S3Service(process.env.AWS_BUCKET_NAME);*/
	}

	async createRent(booking: Booking): Promise<Booking> {
		return await this.bookingRepository.createOne(booking).catch(e => {
			throw new Error('Error creating Rent');
		});
	}

	async scheduleRent(
		user: User,
		scheduledFrom: number,
		scheduledTo: number,
		tour: Tour,
		bpartner: BPartner
		//purposeText: string
	): Promise<Booking> {
		try {
			/** Create rent of vehicle */
			const booking: Booking = new Booking();
			booking.userId = user.id;
			booking.status = BookingStatus.PENDING;
			booking.from = scheduledFrom;
			booking.to = scheduledTo;
			booking.tourId = tour.id;
			booking.bpartnerId = bpartner.id;

			return await this.createRent(booking);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async getBookings(filter: any, pagination?: any): Promise<Booking[]> {
		return await this.bookingRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting Rents');
		});
	}

	/*async getBooking(bookingId: string): Promise<Booking> {
		return await this.bookingRepository.getByIdOrThrow(bookingId).catch(() => {
			throw new Error('Error getting Rent');
		});
	}

	async updateBooking(bookingId: string, data: Partial<Booking>): Promise<Booking> {
		return await this.bookingRepository.updateOne(bookingId, data).catch(() => {
			throw new Error('Error updating Rent');
		});
	}

	async updateBookingPhoto(bookingId: string, data: any): Promise<Booking> {
		return await this.bookingRepository.update(bookingId, data).catch(() => {
			throw new Error('Error updating Rent');
		});
	}


	async getBookingsStat(
		userId: string,
		from: number = 1,
		to: number = 10000000000000
	): Promise<any> {
		const aggregateFilter: any[] = [];
		aggregateFilter.push({
			$match: {
				createdAt: { $gte: from, $lt: to },
				status: RentStatus.FINISHED,
				'vehicle.userId': userId
			}
		});
		aggregateFilter.push({
			$group: {
				_id: '$vehicle.userId',
				rents: { $sum: 1 },
				time: { $sum: '$endTime' },
				mileage: { $sum: '$mileageDone' }
			}
		});
		aggregateFilter.push({
			$project: {
				rents: { $ifNull: ['$rents', 0] },
				time: { $ifNull: ['$time', 0] },
				mileage: { $ifNull: ['$mileage', 0] }
			}
		});
		const aggregatedArray: any[] = await this.bookingRepository
			.aggregate(aggregateFilter)
			.catch(() => {
				throw new Error('Error getting Rents');
			});

		return aggregatedArray[0] || [];
	}

	async count(filter: any): Promise<number> {
		return await this.bookingRepository.count(filter).catch(() => {
			throw new Error('Error counting Rents');
		});
	}

	async uploadFile(bookingId: string, file: MulterFile): Promise<string> {
		return await this.s3Service.uploadBookingFile(bookingId, file).catch(() => {
			throw new Error('Error uploading file Rent');
		});
	}

	async deleteRent(rentId: string): Promise<boolean> {
		return await this.bookingRepository.deleteMany({ _id: rentId }).catch(() => {
			throw new Error('Error deleting Rent');
		});
	}

	// todo : to merge in
	async __uploadFile(bookingId: string, file: MulterFile): Promise<Booking> {
		const url = await this.s3Service.uploadBookingFile(bookingId, file).catch(() => {
			throw new Error('Error uploading file for Rent');
		});

		return await this.updateBookingPhoto(bookingId, {
			$set: { returnImage: url },
			$push: { returnImages: url }
		});
	}

	async __countUserActiveBookings(userId: string): Promise<number> {
		return await this.count({
			status: RentStatus.DRIVING,
			userId: userId
		});
	}

	async __getActiveBookingsFor(userId: string): Promise<Booking[]> {
		return await this.bookingRepository
			.getAllWithSort(
				{
					status: RentStatus.DRIVING,
					userId: userId
				},
				null,
				{ from: 1 }
			)
			.catch(() => {
				throw new Error('Error getting Rents');
			});
	}


	// TODO: refactor this to more functions. It's getting unreadable
	async startRent(
		vehicle: Vehicle,
		user: User,
		locationDev: { lon: number; lat: number } = { lon: 0, lat: 0 }
	): Promise<Booking> {
		try {
			/** Update taken vehicle 
			const updateData: Vehicle = {} as any;

			if (
				vehicle.available === VehicleAvailable.RESERVED ||
				vehicle.available === VehicleAvailable.TOUR_RESERVED
			) {
				updateData['reservation.reservedAt'] = null;
				updateData['reservation.reservedBy'] = null;
			}
			updateData.available = VehicleAvailable.DRIVING;
			updateData.modifiedAt = Date.now();

			let updatedVehicle: Vehicle;

			const startedVehicle: boolean = !!(await this.carManager.powerVehicle(
				vehicle,
				PowerDirection.ON
			));
			this.logger.info(vehicle.IMEI);

			if (startedVehicle) {
				updatedVehicle = await this.carManager.updateVehicle(vehicle.id, updateData);
			} else {
				try {
					if (startedVehicle)
						await this.carManager.powerVehicle(vehicle, PowerDirection.OFF);
					/** If ERRORS occur 
				} catch (error) {
					this.logger.error(error);
				}
			}

			/** Create rent of vehicle 
			const booking: Booking = new Booking();
			booking.userId = user.id;
			booking.vehicle = updatedVehicle;

			// save vehicle state
			const bookingVehicle = deserialize(BookingVehicle, vehicle);
			bookingVehicle.state = new VehicleRentState();
			bookingVehicle.state.start = this.getVehicleState(vehicle, locationDev);
			// array for future proofing with multirent
			booking.vehicles = [bookingVehicle];

			// Save device location which is more accurate
			booking.fromDevLocation = locationDev;
			booking.from = Date.now();
			return await this.createRent(booking);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async endRent(
		booking: Booking,
		vehicle: Vehicle,
		user: User,
		locationDev: { lon: number; lat: number } = { lon: 0, lat: 0 },
		groupRent: boolean = false
	): Promise<Booking> {
		try {
			/** Update taken vehicle 
			booking.returnImage = vehicle?.requiredPhoto ? booking?.returnImage : 'NOT_REQUIRED';
			const updateVData: Vehicle = {} as any;
			updateVData['liveInfo.lockStatus'] = LockStatus.LOCKED;
			updateVData['lastState.lastPhoto'] = booking?.returnImage;
			updateVData['lastState.lastLat'] = vehicle?.liveInfo?.lat;
			updateVData['lastState.lastLon'] = vehicle?.liveInfo?.lon;
			updateVData['lastState.lastLocationLink'] = vehicle?.liveInfo?.loc?.locLink;
			updateVData['lastState.lastRent'] = Date.now();
			updateVData.available = VehicleAvailable.ONLINE;
			updateVData.modifiedAt = Date.now();
			/** Update booking 
			const updateBData: Booking = {} as any;
			updateBData.returnImage = booking?.returnImage;
			updateBData['changeLog.changedBy'] = user.id;
			updateBData['changeLog.changedAt'] = Date.now();
			updateBData.modifiedAt = Date.now();
			updateBData.status = RentStatus.FINISHED;
			// Save device location which is more accurate
			updateBData.toDevLocation = locationDev;
			updateBData.to = Date.now();
			updateBData.mileageDone =
				(vehicle?.liveInfo?.totalMileage - booking?.vehicle?.liveInfo?.totalMileage) / 1000;

			if (booking.vehicle.fuelCapacity > 0)
				updateBData.fuelDiff =
					vehicle?.liveInfo?.fuelLevel - booking?.vehicle?.liveInfo?.fuelLevel;
			else {
				updateBData.fuelDiff =
					vehicle?.liveInfo?.batteryPercentage -
					booking?.vehicle?.liveInfo?.batteryPercentage;
			}

			updateBData.endTime = moment(updateBData.to).diff(booking.from, 'minutes');
			updateBData.returnGeoName = vehicle?.liveInfo?.geoName;
			updateBData.returnLocation = `https://maps.google.com/?q=${vehicle?.liveInfo?.lat},${vehicle?.liveInfo?.lon}`;

			const isPaymentPUF: boolean =
				booking?.vehicle?.pricing?.type === PricingType.PRICE_UP_FRONT ||
				!!booking?.tourId ||
				!!booking?.payment?.tourId;
			if (isPaymentPUF) {
				updateBData.endPrice = roundToTwoDecimal(booking?.payment?.price);
			}
			if (!isPaymentPUF) {
				// Calculate end price
				updateBData.endPrice = roundToTwoDecimal(
					booking.calculatePaymentAmount(updateBData.endTime)
				);
				// Calculate end price if cleaned out
				if (booking.returnImage === RentEndReason.BALANCE_LOW) {
					// We clean the account so no negative balance exists
					updateBData.endPrice = user.getAccountBalance();
					updateBData.returnImage = RentEndReason.BALANCE_LOW;
				}

				/** START Create TRANSACTION for RENT 
				const transferSuccessful: Transaction = await this.userManager.transferBalance(
					booking.id,
					user.id,
					vehicle.userId,
					updateBData.endPrice,
					undefined, // here this is undefined because this is process does not include payment provider
					TransactionType.RENT,
					PaymentType.WALLET
				);
				/** END Create TRANSACTION for RENT 
				if (!transferSuccessful) throw new CustomError(415, 'Transfer unsuccessful');

				updateBData.payment = {
					type: RentType.PPU,
					method: PaymentType.WALLET,
					price: updateBData.endPrice,
					time: updateBData.endTime,
					payedAt: transferSuccessful.createdAt
				};
			}

			const lockedVehicle: boolean = !!(await this.carManager.powerVehicle(
				vehicle,
				PowerDirection.OFF
			));

			updateBData.vehicles = booking.vehicles;

			// get path made during rent
			if (!groupRent) {
				this.carManager
					.getPath(
						vehicle?.trackerInfo?.trackerIMEI,
						updateBData.endTime < 120
							? moment(booking.from).unix()
							: moment(updateBData.to).subtract(2, 'h').unix(),
						moment(updateBData.to).unix()
					)
					.then(data => {
						const updateBookingPathData: Partial<Booking> = { path: data };
						updateBookingPathData.vehicles[0].path = data;
						return this.updateBooking(booking.id, updateBookingPathData);
					})
					.catch(err => this.logger.error('Booking path error: ' + err));
			} else {
				updateBData.path = [];
			}

			if (lockedVehicle) {
				const updatedVehicle: Vehicle = await this.carManager.updateVehicle(
					vehicle.id,
					updateVData
				);
				updateBData.vehicles[0].state.end = this.getVehicleState(
					updatedVehicle,
					locationDev
				);
				return await this.updateBooking(booking.id, updateBData);
			}
		} catch (error) {
			this.logger.error(error);
		}
	}

	async submitReviewOrThrow(
		bookingId: string,
		reviewData: CreateBookingReviewPayload
	): Promise<Booking> {
		const booking: Booking = await this.getBooking(bookingId);
		if (booking.status !== RentStatus.FINISHED)
			throw new CustomError(412, 'Cannot review before ending trip');

		const updateData: any = {
			review: deserialize(Review, reviewData),
			modifiedAt: Date.now()
		};

		return await this.updateBooking(bookingId, updateData).catch(() => {
			throw new CustomError(412, 'Error creating Review');
		});
	}

	async refundBooking(userId: string, booking: Booking, reqIp: string): Promise<Booking> {
		try {
			if (booking.status !== RentStatus.FINISHED)
				throw new CustomError(412, 'Cannot refund before ending trip');

			const transaction: Transaction = await this.transactionManager.getRentTransaction(
				booking.id
			);

			await this.userManager.refundTransaction(transaction, reqIp);

			const updateBData: Booking = {} as any;
			updateBData.status = RentStatus.REFUNDED;
			updateBData['changeLog.changedBy'] = userId;
			updateBData['changeLog.changedAt'] = Date.now();
			return await this.updateBooking(booking.id, updateBData);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async getUserStats(userId: string): Promise<any> {
		try {
			const aggregations = [
				{
					$match: {
						userId: userId,
						status: RentStatus.FINISHED
					}
				},
				{
					$group: {
						_id: '$userId',
						count: { $sum: 1 },
						total: { $sum: '$endTime' },
						average: { $avg: '$endTime' }
					}
				}
			];
			const data = await this.bookingRepository.aggregate(aggregations);
			return data[0];
		} catch (error) {
			this.logger.error(error);
		}
	}

	async getAggregatedForExport(startInterval: number, endInterval: number): Promise<any> {
		const aggregationFilter: any = [
			{
				$match: {
					$and: [
						{ createdAt: { $gte: startInterval } },
						{ createdAt: { $lte: endInterval } }
					]
				}
			},
			{
				$project: {
					id: '$_id',
					userId: { $ifNull: ['$userId', null] },
					'vehicle.id': { $ifNull: ['$vehicle._id', null] },
					code: { $ifNull: ['$code', null] },
					status: { $ifNull: ['$status', null] },
					from: { $ifNull: ['$from', null] },
					to: { $ifNull: ['$to', null] },
					'vehicle.lat': { $ifNull: ['$vehicle.liveInfo.lat', null] },
					'vehicle.lon': { $ifNull: ['$vehicle.liveInfo.lon', null] },
					returnLocation: { $ifNull: ['$returnLocation', null] },
					returnImage: { $ifNull: ['$returnImage', null] },
					endTime: { $ifNull: ['$endTime', null] },
					fuelDiff: { $ifNull: ['$fuelDiff', null] },
					'vehicle.managers': { $ifNull: ['$vehicle.maintainedBy.managers', []] },
					'vehicle.servicers': { $ifNull: ['$vehicle.maintainedBy.servicers', []] },
					'payment.method': { $ifNull: ['$payment.method', null] },
					'payment.time': { $ifNull: ['$payment.time', null] },
					'payment.price': { $ifNull: ['$payment.price', null] }
				}
			}
		];
		return await this.bookingRepository.aggregate(aggregationFilter);
	}

	getVehicleState(vehicle: Vehicle, locationDev: { lon: number; lat: number }): StateInfo {
		// cast vehicle location to GeoLocation class
		const location = new GeoLocation();
		location.lat = vehicle?.liveInfo?.lat;
		location.lng = vehicle?.liveInfo?.lon;

		// cast device location to GeoLocation class
		const device = new GeoLocation();
		device.lat = locationDev?.lat;
		device.lng = locationDev?.lon;

		const state: StateInfo = {
			time: Date.now(),
			lockStatus: vehicle?.liveInfo?.lockStatus,
			location: location,
			device: device,
			battery: vehicle?.liveInfo?.batteryPercentage || -1,
			fuel: vehicle?.liveInfo?.fuelLevel || -1,
			mileage: vehicle?.liveInfo?.totalMileage,
			speedLimit: vehicle?.liveInfo?.speedLimit,
			operatingMode: vehicle?.liveInfo?.operatingMode || -1,
			doorStatus: vehicle?.liveInfo?.doorStatus || -1,
			imobilized: vehicle?.liveInfo?.imobilized,
			image: vehicle?.lastState?.lastPhoto,
			geoName: vehicle?.liveInfo?.geoName,
			country: vehicle?.liveInfo?.country,
			signalTime: vehicle?.liveInfo?.modifiedAt
		};
		return state;
	}*/
}
