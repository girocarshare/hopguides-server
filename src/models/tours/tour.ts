import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { min } from '../../validations/decorators';
import { VehicleType } from '../vehicle/enums';
import { ReturnLocation } from './returnOptions';
import { LocalizedField } from '../localizedField';
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
	bpartnerId: string;
	
	@jsonProperty()
	@dbField()
	agreementTitle: LocalizedField;

	@jsonProperty()
	@dbField()
	agreementDesc: LocalizedField;

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
	
	@jsonProperty()
	@dbField()
	currency: string;
	
	@jsonProperty({ type: String })
	@dbField({ type: String })
	points: string[] = [];


	@jsonProperty()
	@dbField()
	returnLocation: ReturnLocation;

	@jsonProperty()
	@dbField()
	createdAt: number = Date.now();

	
	@jsonProperty()
	@dbField()
	image: string;
	
	@jsonProperty()
	@dbField()
	audio: string;
	
	@jsonProperty()
	@dbField()
	duration: string;

	
	@jsonProperty()
	@dbField()
	length: string;

	
	@jsonProperty()
	@dbField()
	highestPoint: string;


	@jsonProperty()
	@dbField()
	termsAndConditions: string;
}
