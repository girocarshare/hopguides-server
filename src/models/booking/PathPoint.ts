 
import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class PathPoint {
	@jsonProperty()
	@dbField()
	timestamp: number;

	@jsonProperty()
	@dbField()
	id: number;

	@jsonProperty()
	@dbField()
	latitude: number;

	@jsonProperty()
	@dbField()
	longitude: number;

	@jsonProperty()
	@dbField()
	speed: number;

	@jsonProperty()
	@dbField()
	iso2: string;

	@jsonProperty()
	@dbField()
	milage_can: number;

	@jsonProperty()
	@dbField()
	total_odometer: number;
}
