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

	async aggregateGetTours(name: string): Promise<Tour[]> {
		const aggregation = this.buildGetToursAggregation(name);
		const tours = await this.collection.aggregate(aggregation).toArray();
		return tours.map(a => deserializeFromDb(Tour, a));
	}

	buildGetToursAggregation(name: string): any[] {
		return [
			{
				$regex: {
					"title.english": " htd"
				}
			},
			
		];
	}
}

export default new TourRepository();
