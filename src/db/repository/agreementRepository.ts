
import { MongoRepository } from './mongoRepository';
import { deserializeFromDb } from '../dbUtils';
import { Agreement } from '../../models/tours/agreement';

export class AgreementRepository extends MongoRepository<Agreement> {
	constructor() {
		super();
	}

	mapObject(data: any): Agreement {
		return deserializeFromDb(Agreement, data);
	}


}

export default new AgreementRepository();

