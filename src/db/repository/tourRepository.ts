import { deserializeFromDb } from '../dbUtils';
import { MongoRepository } from './mongoRepository';
import { Tour } from '../../models/tours/tour';

export class TourRepository extends MongoRepository<Tour> {
	constructor() {
		super();
	}

	mapObject(data: any): Tour {
		return deserializeFromDb(Tour, data);
	}
}

export default new TourRepository();
