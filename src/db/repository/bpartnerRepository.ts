import { BPartner } from '../../models/bpartner/bpartner';
import { MongoRepository } from './mongoRepository';
import { deserializeFromDb } from '../dbUtils';

class BPartnerRepository extends MongoRepository<BPartner> {
	constructor() {
		super();
	}

	mapObject(data: any): BPartner {
		return deserializeFromDb(BPartner, data);
	}
}

export default new BPartnerRepository();
