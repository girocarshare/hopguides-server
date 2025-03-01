import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateRideCode, generateUuid } from '../../utils/utils';
import { Vehicle } from '../vehicle/vehicle';
import { Review } from '../review/review';
import { ChangeLog } from '../classes';
import { PathPoint } from './PathPoint';
import { validEnum } from '../../validations/decorators';
import { Payment } from './payment';
// import { BookingVehicle } from './bookingVehicle';
import { GeneratedVoucher } from './bookingVoucher';
import { BookingPricing } from './bookingPricing';
import { BookingDocs } from './bookingDocs';
import { PoiHelp } from './PoiHelp';

export enum BookingStatus {
  STARTED = 'STARTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  RESERVED = 'RESERVED',
  BOOKED = 'BOOKED',
  DRIVING = 'DRIVING',
  FINISHED = 'FINISHED',
  /** END statuses */
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  TIMED_OUT = 'TIMED_OUT',
  NO_PICKUP = 'NO_PICKUP',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export enum RentEndReason {
  BALANCE_LOW = 'BALANCE_LOW',
  BATTERY_LOW = 'BATTERY_LOW',
}

export enum PaymentMethod {
  PAYWISER = 'PYW',
}

export enum PaymentType {
  CARD = 'CARD',
  VALU = 'VALU',
  WALLET = 'WALLET',
}

export enum RentType {
  PPU = 'PPU',
  PUF = 'PUF',
  TOUR = 'TOUR',
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
  status: BookingStatus;

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
  @jsonProperty({ deserialize: true, serialize: true })
  tourId: string;

  @dbField()
  @jsonProperty({ deserialize: true, serialize: true })
  bpartnerId: string;

  @jsonProperty({ type: PoiHelp })
  @dbField({ type: PoiHelp })
  points: PoiHelp[] = [];

  static start(userId: string): Booking {
    const booking: Booking = new Booking();
    booking.userId = userId;
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
