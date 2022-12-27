import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateRideCode, generateUuid } from '../../utils/utils';
import { Vehicle } from '../vehicle/vehicle';
import { Review } from '../review/review';
import { ChangeLog } from '../classes';
import { PathPoint } from './PathPoint';
import { validEnum } from '../../validations/decorators';
import { Payment } from './payment';
import { BookingVehicle } from './bookingVehicle';
import {GeneratedVoucher } from './bookingVoucher';
import { BookingPricing } from './bookingPricing';
import { BookingDocs } from './bookingDocs';

export enum RentStatus {
	SCHEDULED = 'SCHEDULED',
	DRIVING = 'DRIVING',
	FINISHED = 'FINISHED',
	/** END statuses */
	ARCHIVED = 'ARCHIVED',
	REFUNDED = 'REFUNDED',
	DELETED = 'DELETED',
	FAILED = 'FAILED'
}

export enum RentEndReason {
	BALANCE_LOW = 'BALANCE_LOW',
	BATTERY_LOW = 'BATTERY_LOW'
}

export enum PaymentMethod {
	PAYWISER = 'PYW'
}

export enum PaymentType {
	CARD = 'CARD',
	VALU = 'VALU',
	WALLET = 'WALLET'
}

export enum RentType {
	PPU = 'PPU',
	PUF = 'PUF',
	TOUR = 'TOUR'
}

export class Booking {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	userId: string;

	@jsonProperty()
	@dbField()
	code: string = generateRideCode();

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	status: RentStatus = RentStatus.DRIVING;

	@dbField()
	@jsonProperty()
	vehicle: Vehicle;

	@dbField()
	@jsonProperty()
	from: number;

	@dbField()
	@jsonProperty()
	to: number;

	@dbField()
	@jsonProperty()
	bookingNumber: number;
	
	@dbField()
	@jsonProperty()
	paymentMethod: PaymentMethod;

	@dbField()
	@jsonProperty()
	pricing: BookingPricing;
	
	@dbField()
	@jsonProperty()
	documents: BookingDocs;

	@dbField()
	@jsonProperty()
	review: Review;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	createdAt: number = Date.now();

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	modifiedAt: number;

	@dbField()
	@jsonProperty()
	changeLog: ChangeLog = new ChangeLog();

	@dbField()
	@jsonProperty()
	tourId: string; // tells if this is tour booking and which booking it is


	static start(car: Vehicle, userId: string): Booking {
		const booking: Booking = new Booking();
		booking.userId = userId;
		booking.vehicle = car;
		booking.from = Date.now();
		return booking;
	}

	/*calculatePaymentAmount(rentTime: number): number {
		return (
			Math.abs(this.vehicle.pricing.pricePerMinute * rentTime) +
			this.vehicle.pricing.startingFee
		);
	}*/
}
