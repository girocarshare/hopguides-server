import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { GeoLocation } from '../address/geoLocation';
import { LocalizedField } from '../localizedField';

import { generateUuid } from '../../utils/utils';


export enum Category {
	HISTORY = 'HISTORY',
	DRINKS = 'DRINKS',
	NATURE = 'NATURE',
	EATS = 'EATS',
	BRIDGE = 'BRIDGE',
	MUSEUMS = 'MUSEUMS',
	EXPERIENCE = 'EXPERIENCE',
	
}

class Contact {
	@jsonProperty()
	@dbField()
	phone: string;
	
	@jsonProperty()
	@dbField()
	name: string;

	@jsonProperty()
	@dbField()
	email: string;

	@jsonProperty()
	@dbField()
	webURL: string;

}


class FromTo {
	@jsonProperty()
	@dbField()
	from: string;

	@jsonProperty()
	@dbField()
	to: string;

}

class WorkingHours {
	@jsonProperty()
	@dbField()
	monday: FromTo;

	@jsonProperty()
	@dbField()
	tuesday: FromTo;

	@jsonProperty()
	@dbField()
	wednesday: FromTo;
	
	@jsonProperty()
	@dbField()
	thursday: FromTo;
	
	@jsonProperty()
	@dbField()
	friday: FromTo;
	
	@jsonProperty()
	@dbField()
	saturday: FromTo;
	
	@jsonProperty()
	@dbField()
	sunday: FromTo;

}

export class POI {

	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();


	@jsonProperty()
	@dbField()
	idField: number;

	
	@jsonProperty()
	@dbField()
	name: string;

	@jsonProperty()
	@dbField()
	location: GeoLocation;

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
	contact: Contact;

	
	@jsonProperty()
	@dbField()
	workingHours: WorkingHours;

	@jsonProperty({ type: String })
	@dbField({ type: String })
	images: string[];

	@jsonProperty()
	@dbField()
	icon: string;

	@jsonProperty({ type: String })
	@dbField({ type: String })
	files: string[];
	
	@jsonProperty()
	@dbField()
	menu: string
	

	@jsonProperty()
	@dbField()
	offerName: string;
	
	@jsonProperty()
	@dbField()
	price: number;

	@jsonProperty()
	@dbField()
	bpartnerId: string;

	@dbField()
	@jsonProperty()
	category: string;

	
	@jsonProperty()
	@dbField()
	audio: string;
}
