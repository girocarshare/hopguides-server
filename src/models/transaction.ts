import { dbField, id } from '../db/decorators';
import { jsonProperty } from '../json/decorations';
import { generateUuid } from '../utils/utils';
import { PaymentType } from './booking/booking';
import { ChangeLog } from './classes';

export enum TransactionType {
	PROMO = 'PROMO', // just for coupons & refferals
	GIFT = 'GIFT', // just for support
	REFUND = 'REFUND', // just for support
	TOP_UP = 'TOP_UP',
	TOP_UP_VALU = 'TOP_UP_VALU',
	RESERVATION_CANCEL = 'RESERVATION_CANCEL',
	RENT = 'RENT',
	RIDE_SHARE = 'RIDE_SHARE',
	RIDE_SHARE_CANCEL = 'RIDE_SHARE_CANCEL',
	RIDE_SHARE_NOPICKUP = 'RIDE_SHARE_NOPICKUP',
	PAYOUT_USER = 'PAYOUT_USER',
	RENT_UP_FRONT = 'RENT_UP_FRONT',
	RENT_TOUR = 'RENT_TOUR'
}

export enum TransactionSuccess {
	SUCCESS = 'SUCCESS',
	PENDING = 'PENDING',
	FAIL = 'FAIL'
}

export class Breakdown {
	@jsonProperty()
	@dbField()
	earnedAmount: number = 0;

	@jsonProperty()
	@dbField()
	serviceFee: number = 0;

	@jsonProperty()
	@dbField()
	spentPromo: number = 0;
}

export class Transaction {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	amount: number;

	@jsonProperty()
	@dbField()
	items: Breakdown = new Breakdown();

	@jsonProperty()
	@dbField()
	transType: TransactionType;

	@jsonProperty()
	@dbField()
	spendingId: string = null;

	@jsonProperty()
	@dbField()
	payId: string;

	@jsonProperty()
	@dbField()
	simplePayId: string;

	@jsonProperty()
	@dbField()
	paymentType: PaymentType;

	@jsonProperty()
	@dbField()
	payedBy: string;

	@jsonProperty()
	@dbField()
	payedTo: string;

	@jsonProperty()
	@dbField()
	usedPromoCode: string = null;

	@jsonProperty()
	@dbField()
	transactionProcessed: TransactionSuccess = TransactionSuccess.FAIL;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	createdAt: number = Date.now();

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	modifiedAt: number;

	@jsonProperty()
	@dbField()
	receiptId: string;

	@jsonProperty()
	@dbField()
	receiptDoc: string;

	@dbField()
	@jsonProperty()
	changeLog: ChangeLog = new ChangeLog();
}
