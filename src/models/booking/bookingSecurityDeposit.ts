import { double } from 'aws-sdk/clients/lightsail';
import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export enum SecurityDepositStatus {
	PENDING = 'PENDING',
	RESERVED = 'RESERVED',
	RELEASED = 'RELEASED',
	CANCELED = 'CANCELED',
	FAILED_RESERVE = 'FAILED_RESERVE'
}

export class BookingSecurityDeposit {
	@dbField()
	@jsonProperty()
	amount: double = 0.0;

	@dbField()
	@jsonProperty()
	transactionId: string = null;

	@dbField()
	ThreeDSecID: string = null;

	@dbField()
	@jsonProperty()
	status: SecurityDepositStatus = SecurityDepositStatus.PENDING;

	@dbField()
	@jsonProperty()
	retryCount = 0;
}
