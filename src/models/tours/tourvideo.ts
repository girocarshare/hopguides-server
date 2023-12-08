import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { min } from '../../validations/decorators';
import { VehicleType } from '../vehicle/enums';
import { ReturnLocation } from './returnOptions';
import { LocalizedField } from '../localizedField';
import { Vehicle } from '../vehicle/vehicle';
import { POIVideo } from './poiModelVideo';

export class TourVideo {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	title: string;

	
	@jsonProperty()
	@dbField()
	ads: string;

	@jsonProperty()
	@dbField()
	userId: string;

	
	@jsonProperty()
	@dbField()
	paymentLink: string;
	
	@jsonProperty({ type: String })
	@dbField({ type: String })
	points: POIVideo[] = [];

	
}
