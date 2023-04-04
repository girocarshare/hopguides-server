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
			booking.status = BookingStatus.STARTED;
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

	async getBooking(bookingId: string): Promise<Booking> {
		return await this.bookingRepository.getByIdOrThrow(bookingId).catch(() => {
			throw new Error('Booking not found!');
		});
	}

	async endBooking(bookingId: string) {

		var booking : Booking = await this.bookingRepository.getByIdOrThrow(bookingId).catch(() => {
			throw new Error('Booking not found!');
		});

		booking.status = BookingStatus.FINISHED;

		await this.bookingRepository.updateOne(bookingId, booking).catch((err) => {
			throw new Error('Error updating booking');
		});
	}

	async scanQR(bookingId: string, pointId: string) {

		var booking : Booking = await this.bookingRepository.getByIdOrThrow(bookingId).catch(() => {
			throw new Error('Booking not found!');
		});

		var points = []
		for(var poi of booking.points){

			if(poi.id == pointId){

				if(poi.used==true){
					throw new Error('Coupon already used');
				}else{
				var point={
					id: poi.id,
					qrCode: poi.qrCode,
					used:true
				}
				points.push(point)
			}
				
			}else{
				points.push(poi)
			}
		}
		booking.points = points;

		await this.bookingRepository.updateOne(bookingId, booking).catch((err) => {
			throw new Error('Error updating booking');
		});
	}
}
