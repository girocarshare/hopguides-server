import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { integer, max, min } from '../../validations/decorators';

export class Review {
	@id()
	@jsonProperty()
	@dbField()
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	bookingId: string;

	@jsonProperty()
	@dbField()
	vehicleId: string;

	@jsonProperty()
	@dbField()
	reviewerId: string;

	@jsonProperty()
	@dbField()
	ownerId: string;

	@jsonProperty()
	@dbField()
	customerId: string;

	@jsonProperty()
	@dbField()
	@min(0)
	@max(10)
	@integer()
	responsiveness: number;

	@jsonProperty()
	@dbField()
	@min(0)
	@max(10)
	@integer()
	friendliness: number;

	@jsonProperty()
	@dbField()
	@min(0)
	@max(10)
	@integer()
	carCondition: number;

	@jsonProperty()
	@dbField()
	message: string;

	@jsonProperty()
	@dbField()
	createdAt: number = Date.now();
}
