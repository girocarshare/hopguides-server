import { deserializeFromDb } from '../dbUtils';
import { Tour } from '../../models/tours/tour';
import { MongoRepository } from './mongoRepository';

export class TourRepository extends MongoRepository<Tour> {
	constructor() {
		super();
	}

	mapObject(data: any): Tour {
		return deserializeFromDb(Tour, data);
	}
}

export default new TourRepository();
