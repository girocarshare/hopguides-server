import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { GeoLocation } from '../address/geoLocation';
import { LocalizedField } from '../localizedField';

class Contact {
	@jsonProperty()
	@dbField()
	phone: string;

	@jsonProperty()
	@dbField()
	email: string;

	// we don't yet have Address class
	@jsonProperty()
	@dbField()
	address: string;

	@jsonProperty()
	@dbField()
	webURL: string;

}

export class POI {
	@jsonProperty()
	@dbField()
	id: number;

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
	used: boolean;
}
