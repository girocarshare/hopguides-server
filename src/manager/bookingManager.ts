import { PaymentType, RentEndReason, RentType } from './../models/booking/booking';
import BookingRepo, { BookingRepository } from '../db/repository/bookingRepository';
import { Booking, BookingStatus } from '../models/booking/booking';
import { User } from '../models/user/user';
import { Tour } from '../models/tours/tour';
import { BPartner } from '../models/bpartner/bpartner';
import { PoiHelp } from '../models/booking/PoiHelp';
import { Logger } from 'tslog';

export class BookingManager {
	bookingRepository: BookingRepository;
	logger: Logger = new Logger();

	constructor() {
		this.bookingRepository = BookingRepo;
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
		bpartner: BPartner,
		points: PoiHelp[]
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
			booking.points = points;

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
}
