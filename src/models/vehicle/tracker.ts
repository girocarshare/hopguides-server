import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { required } from '../../validations/decorators';

export class Tracker {
	@jsonProperty()
	@dbField()
	@required()
	trackerIMEI: string;

	@jsonProperty()
	@dbField()
	@required()
	trackerPhone: string;

	@jsonProperty()
	@dbField()
	btlockIMEI: string;
}
