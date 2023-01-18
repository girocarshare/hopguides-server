import poiRepository, { POIRepository } from '../db/repository/poiRepository';
import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { POI } from '../models/tours/poi';
//import { deserializeFromDb } from '../db/dbUtils';
//import { GetTourPayload } from '../classes/tour/getTourPayload';

import { MulterFile } from '../classes/interfaces';
export class POIManager {
	poiRepository: POIRepository;
	constructor() {
		this.poiRepository = poiRepository;

	}

	async getPoi(poiId: string): Promise<POI> {
		return await this.poiRepository.getByIdOrThrow(poiId).catch(() => {
			throw new CustomError(404, 'POI not found!');
		});
	}

	async getPois(filter?: any, pagination?: SearchPagination): Promise<POI[]> {
		return await this.poiRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting pois');
		});
	}

	async uploadMenu(pointId: string, file: MulterFile): Promise<POI> {
		var point: POI = await this.getPoi(pointId)

		point.menu = file.path
		return await this.poiRepository.updateOne(pointId, point).catch(() => {
			throw new Error('Error updating Tour');
		});
	}


	
	async updatePoi(pointId: string, data: Partial<POI>): Promise<POI> {

		return await this.poiRepository.updateOne(pointId, data).catch((err) => {
			console.log("tuut")
			console.log(err)
		   throw new Error('Error updating poi');
	   });

	  
   }
/*
	async uploadMenu(tourId: string, file: MulterFile): Promise<Tour> {
		var tours: Tour[] =  await this.tourRepository.getAll().catch(() => {
			throw new Error('Error getting Tours');
		});

		for(var tour of tours){
			//if()
			for(var point of tour.points){

			}
		}

		var tour : Tour
		return tour;
	}


	/*async __uploadFile(tourId: string, file: MulterFile): Promise<Tour> {
		const url = await this.s3Service.uploadMenuFile(tourId, file).catch(() => {
			throw new Error('Error uploading file for Rent');
		});

		return await this.updateMenuPhoto(tourId, {
			$set: { returnImage: url },
			$push: { returnImages: url }
		});
	}
	async updateMenuPhoto(tourId: string, data: any): Promise<Tour> {
		return await this.tourRepository.update(tourId, data).catch(() => {
			throw new Error('Error updating Rent');
		});
	}*/
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
	/*async updatePOI(poiId: string, data: Partial<Tour>): Promise<Tour> {
		return await this.tourRepository.updateOne(tourId, data).catch(() => {
			throw new Error('Error updating Tour');
		});
	}*/

	async createPOI(poi: POI): Promise<POI> {
		return await this.poiRepository.createOne(poi).catch(() => {
			
			throw new CustomError(500, 'POI not created!');
		});
	}
}
