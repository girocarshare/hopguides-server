import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { PaymentType, RentType } from './booking';

export class Payment {
	@jsonProperty()
	@dbField()
	method: PaymentType;

	@jsonProperty()
	@dbField()
	type: RentType;

	@jsonProperty()
	@dbField()
	price: number;

	@jsonProperty()
	@dbField()
	time: number;

	@jsonProperty()
	@dbField()
	payedAt: number;

	@jsonProperty()
	@dbField()
	tourId?: string;
}
