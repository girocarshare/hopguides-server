import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { CustomError } from '../classes/customError';
//import { SearchPagination } from '../classes/searchPagination';
import { Tour } from '../models/tours/tour';
//import { deserializeFromDb } from '../db/dbUtils';
//import { GetTourPayload } from '../classes/tour/getTourPayload';

export class TourManager {
	tourRepository: TourRepository;

	constructor() {
		this.tourRepository = tourRepository;
	}

	async getTour(tourId: string): Promise<Tour> {
		return await this.tourRepository.getByIdOrThrow(tourId).catch(() => {
			throw new CustomError(404, 'Tour not found!');
		});
	}

	/*async getTours(filter?: any, pagination?: SearchPagination): Promise<Tour[]> {
		return await this.tourRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting Tours');
		});
	}

	/*async getTranslatedTour(tourId: string, locale: string = 'en'): Promise<any> {
		const aggregateFilter: any[] = [];
		aggregateFilter.push({
			$match: {
				_id: tourId
			}
		});
		aggregateFilter.push({
			$set: {
				id: '$_id',
				title: `$title.${locale}`,
				longInfo: `$longInfo.${locale}`,
				timeInfo: `$timeInfo.${locale}`,
				paymentInfo: `$paymentInfo.${locale}`,
				shortInfo: `$shortInfo.${locale}`,
				points: {
					$map: {
						input: '$points',
						as: 'point',
						in: {
							$mergeObjects: [
								'$$point',
								{
									title: `$$point.title.${locale}`,
									shortInfo: `$$point.shortInfo.${locale}`,
									longInfo: `$$point.longInfo.${locale}`
								}
							]
						}
					}
				}
			}
		});
		const tour = await this.tourRepository.aggregate(aggregateFilter);
		if (tour) return deserializeFromDb(GetTourPayload, tour[0]);
		else throw new CustomError(404, 'tour not found');
	}
*/
	async updateTour(tourId: string, data: Partial<Tour>): Promise<Tour> {
		return await this.tourRepository.updateOne(tourId, data).catch(() => {
			throw new Error('Error updating Tour');
		});
	}

	async createTour(tour: Tour): Promise<Tour> {
		return await this.tourRepository.createOne(tour).catch(() => {
			throw new CustomError(500, 'Tour not created!');
		});
	}
}
