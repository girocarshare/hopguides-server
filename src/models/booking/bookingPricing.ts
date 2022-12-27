import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { BookingAdditionalCost } from './bookingAdditionalCost';
import { BookingSecurityDeposit } from './bookingSecurityDeposit';
import { double } from 'aws-sdk/clients/lightsail';

export enum PaymentStatus {
	FAILED_PAYMENT = 'FAILED_PAYMENT',
	CANCELED = 'CANCELED',
	PAID = 'PAID',
	PENDING = 'PENDING'
}

export class BookingPricing {
	@dbField()
	@jsonProperty()
	basePrice: double = 0.0;

	@dbField()
	@jsonProperty()
	serviceFee: double = 0.0;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	transactionId: string = null;

	@dbField()
	ThreeDSecID: string = null;

	@dbField()
	@jsonProperty()
	paymentStatus: PaymentStatus = PaymentStatus.PENDING;

	@dbField()
	@jsonProperty()
	additionalCost: BookingAdditionalCost = null;

	@dbField()
	@jsonProperty()
	securityDeposit: BookingSecurityDeposit = new BookingSecurityDeposit();
}
