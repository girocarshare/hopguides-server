import { BPartner } from '../../models/bpartner/bpartner';
import { deserializeFromDb } from '../dbUtils';
import { MongoRepository } from './mongoRepository';

class BPartnerRepository extends MongoRepository<BPartner> {
	constructor() {
		super();
	}

	mapObject(data: any): BPartner {
		return deserializeFromDb(BPartner, data);
	}
}

export default new BPartnerRepository();
