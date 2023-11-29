import { deserializeFromDb } from '../dbUtils';
import { MongoRepository } from './mongoRepository';
import { Tour } from '../../models/tours/tour';
import { TourVideo } from '../../models/tours/tourvideo';

export class TourVideoRepository extends MongoRepository<TourVideo> {
	constructor() {
		super();
	}

	mapObject(data: any): TourVideo {
		return deserializeFromDb(TourVideo, data);
	}

	

	
}

export default new TourVideoRepository();
