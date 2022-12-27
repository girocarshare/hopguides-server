import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { ChangeLog } from '../classes';

export enum PromoType {
	TOPUP_BONUS = 'TOPUP_BONUS', // one time value
	COUPON = 'COUPON', // one time value
	MULTIPLIER = 'MULTIPLIER', // multiplies
	DISCOUNT = 'DISCOUNT' // discount classic
}

export enum Redeemable {
	ALL = 'ALL',
	CARSHARE = 'CARSHARE',
	MOBILITY = 'MOBILITY'
}

export enum Partner {
	GIRO = 'GIRO',
	EYCA = 'EYCA',
	VALU = 'VALU'
}

export class PromoCode {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	owner: Partner = Partner.GIRO;

	@jsonProperty()
	@dbField()
	code: string = 'Insert code name here...';

	@jsonProperty()
	@dbField()
	text: string = 'Insert promo text here...';

	@jsonProperty()
	@dbField()
	type: PromoType = PromoType.COUPON;

	@jsonProperty()
	@dbField()
	active: boolean = false;

	@jsonProperty()
	@dbField()
	value: number = 0;

	@jsonProperty()
	@dbField()
	percent: boolean = false;

	@jsonProperty()
	@dbField()
	usageNumber: number = 0;

	@jsonProperty()
	@dbField()
	usageLimit: number = 0;

	@dbField()
	@jsonProperty()
	validFrom: number = 0;

	@dbField()
	@jsonProperty()
	validTo: number = 0;

	@jsonProperty({ type: String })
	@dbField({ type: String })
	conditions: string[] = [];

	@jsonProperty({ type: String })
	@dbField({ type: String })
	appliedBy: string[] = [];

	@jsonProperty({ type: String })
	@dbField({ type: String })
	usedBy: string[] = [];

	@jsonProperty()
	@dbField()
	redeemOn: Redeemable = Redeemable.ALL;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	createdAt: number = Date.now();

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	modifiedAt: number;

	@dbField()
	@jsonProperty()
	changeLog: ChangeLog = new ChangeLog();
}
