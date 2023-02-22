import { double } from 'aws-sdk/clients/lightsail';
import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export enum CleaningFee {
	NO_FEE = 'NO_FEE',
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH'
}

export enum AdditionalCostStatus {
	SUBMITTED = 'SUBMITTED',
	DECLINED = 'DECLINED',
	PAID = 'PAID',
	FAILED_PAYMENT = 'FAILED_PAYMENT'
}

export class BookingAdditionalCost {
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	lateReturn: number;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	extraMileage: number;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	cleaningFee: CleaningFee;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	deliveryKm: number;

	@dbField()
	@jsonProperty()
	basePrice: double = 0.0;

	@dbField()
	@jsonProperty()
	serviceFee: double = 0.0;

	@dbField()
	@jsonProperty()
	transactionId: string = null;

	@dbField()
	ThreeDSecID: string = null;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	status: AdditionalCostStatus = AdditionalCostStatus.SUBMITTED;

	constructor(data?: any) {
		if (!data) return;
		this.lateReturn = data.lateReturn;
		this.extraMileage = data.extraMileage;
		this.cleaningFee = data.cleaningFee;
		this.deliveryKm = data.deliveryKm;
	}
}
