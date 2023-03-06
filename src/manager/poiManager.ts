import poiRepository, { POIRepository } from '../db/repository/poiRepository';
import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { POI } from '../models/tours/poi';

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

	async uploadImages(pointId: string, file: string[]): Promise<POI> {
		var point: POI = await this.getPoi(pointId)

		point.images = file
		return await this.poiRepository.updateOne(pointId, point).catch(() => {
			throw new Error('Error updating Tour');
		});
	}
	
	async updatePoi(pointId: string, data: Partial<POI>): Promise<POI> {

		return await this.poiRepository.updateOne(pointId, data).catch((err) => {
		   throw new Error('Error updating poi');
	   });

	  
   }

	async createPOI(poi: POI): Promise<POI> {
		return await this.poiRepository.createOne(poi).catch(() => {
			
			throw new CustomError(500, 'POI not created!');
		});
	}
}
