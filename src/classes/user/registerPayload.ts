import { jsonProperty } from '../../json/decorations';
import { email, notEmpty, required } from '../../validations/decorators';

import { GeoLocation } from '../../models/address/geoLocation';
class Contact {
	@jsonProperty()
	phone: string;

	@jsonProperty()
	phone2: string;
	
	@jsonProperty()
	name: string;

	@jsonProperty()
	email: string;

	@jsonProperty()
	webURL: string;

	@jsonProperty()
	location: GeoLocation;

}

export class Dimensions {

	
	@jsonProperty()
	width: string;
	
	@jsonProperty()
	height: string;


}

export class RegisterPayload {

	@jsonProperty()
	contact: Contact;

	@jsonProperty()
	userId: string;

	@jsonProperty()
	name: string;

	
	@jsonProperty()
	dimensions: Dimensions;
}

