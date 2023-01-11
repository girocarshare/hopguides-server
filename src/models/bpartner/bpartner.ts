import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';

export enum BPartnerStatus {
	DELETED = 'DELETED',
	INACTIVE = 'INACTIVE',
	ACTIVE = 'ACTIVE'
}

export class BPartnerDiscount {
	@jsonProperty()
	@dbField()
	serviceFeeDiscount: number = 0;

	@jsonProperty()
	@dbField()
	addCostFeeDicount: number = 0;
}

export class BPartnerStats {
	@jsonProperty()
	@dbField()
	numberOfVehicles: number = 0;

	@jsonProperty()
	@dbField()
	requestApprovedPercent: number = 0;

	@jsonProperty()
	@dbField()
	averageResponseTime: number = 0;
}

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
	earnings: number = 0;

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
}
