import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { min } from '../../validations/decorators';
import { VehicleType } from '../vehicle/enums';
import { ReturnLocation } from './returnOptions';
import { LocalizedField } from '../localizedField';
import { POI } from './POI';
import { Vehicle } from '../vehicle/vehicle';

export class Tour {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	title: LocalizedField;

	@jsonProperty()
	@dbField()
	shortInfo: LocalizedField;

	@jsonProperty()
	@dbField()
	longInfo: LocalizedField;

	@jsonProperty()
	@dbField()
	timeInfo: LocalizedField;

	@jsonProperty({ type: String })
	@dbField({ type: String })
	images: string[];

	@jsonProperty()
	@dbField()
	paymentInfo: LocalizedField;

	@jsonProperty()
	@dbField()
	@min(1)
	time: number;

	@jsonProperty()
	@dbField()
	@min(0)
	price: number;

	@jsonProperty({ type: POI })
	@dbField({ type: POI })
	points: POI[];

	@jsonProperty()
	@dbField()
	returnLocation: ReturnLocation;

	@jsonProperty()
	@dbField()
	createdAt: number = Date.now();
}
