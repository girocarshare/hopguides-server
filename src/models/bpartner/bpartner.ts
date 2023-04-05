import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { GeoLocation } from '../address/geoLocation';
import { LocalizedField } from '../localizedField';

export enum BPartnerStatus {
	DELETED = 'DELETED',
	INACTIVE = 'INACTIVE',
	ACTIVE = 'ACTIVE'
}

export class BPartnerDiscount {
	@jsonProperty()
	@dbField()
	serviceFeeDiscount = 0;

	@jsonProperty()
	@dbField()
	addCostFeeDicount = 0;
}

export class BPartnerStats {
	@jsonProperty()
	@dbField()
	numberOfVehicles = 0;

	@jsonProperty()
	@dbField()
	requestApprovedPercent = 0;

	@jsonProperty()
	@dbField()
	averageResponseTime = 0;
}

class Contact {
	@jsonProperty()
	@dbField()
	phone: string;

	
	@jsonProperty()
	@dbField()
	phone2: string;

	@jsonProperty()
	@dbField()
	email: string;

	@jsonProperty()
	@dbField()
	location: GeoLocation;

	@jsonProperty()
	@dbField()
	webURL: string;

}
class Dimensions {

	
	@jsonProperty()
	@dbField()
	width: string;
	
	@jsonProperty()
	@dbField()
	height: string;


}

export class BPartner {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	userId: string;
	
	@jsonProperty()
	@dbField()
	name: string;

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	status: BPartnerStatus = BPartnerStatus.INACTIVE;

	@jsonProperty()
	@dbField()
	earnings = 0;

	@jsonProperty()
	@dbField()
	discount: BPartnerDiscount = new BPartnerDiscount();

	@jsonProperty()
	@dbField()
	stats: BPartnerStats = new BPartnerStats();

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	createdAt: number = Date.now();

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	modifiedAt: number;
	
	@jsonProperty()
	@dbField()
	contact: Contact = new Contact();

	
	@jsonProperty()
	@dbField()
	logo: string;

	@jsonProperty()
	@dbField()
	dimensions: Dimensions;

	
	@jsonProperty()
	@dbField()
	support: LocalizedField;

	
	@jsonProperty()
	@dbField()
	lockCode: string;
}
