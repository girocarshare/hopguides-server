import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { required } from '../../validations/decorators';

export class ReturnLocation {
	@jsonProperty()
	@dbField()
	@required()
	lat: number;

	@jsonProperty()
	@dbField()
	@required()
	lon: number;

	@jsonProperty()
	@dbField()
	@required()
	offset: number;
}

export class ReturnOptions {
	@jsonProperty()
	@dbField()
	@required()
	returnReq: Boolean;

	@jsonProperty({ type: ReturnLocation })
	@dbField({ type: ReturnLocation })
	returnLoc: ReturnLocation[];
}
