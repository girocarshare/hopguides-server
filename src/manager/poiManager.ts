import poiRepository, { POIRepository } from '../db/repository/poiRepository';
import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { Image, POI } from '../models/tours/poiModel';

import { MulterFile } from '../classes/interfaces';
import { LocalizedField } from '../models/localizedField';
export class Obj {
  names: {number: string, name: LocalizedField}[]
  paths: string[]
}
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

  async getPoiByPreviousId(poiId: string): Promise<POI> {
    return await this.poiRepository.findOne({previousId: poiId}).catch(() => {
      throw new CustomError(404, 'POI not found!');
    });
  }

  async getPois(filter?: any, pagination?: SearchPagination): Promise<POI[]> {
    return await this.poiRepository.getAll(filter, pagination).catch((err) => {
      console.log(err.error)
      throw new Error('Error getting pois');
    });
  }

	async uploadMenu(pointId: string, file: string): Promise<POI> {
     
		var point: POI = await this.getPoi(pointId)

    console.log(point)
		point.menu = file      
    console.log(point)
		return await this.poiRepository.updateOne(pointId, point).catch(() => {
    
			throw new Error('Error updating poi');
		});
	}

 
  async uploadImages(pointId: string, object: Obj): Promise<POI> {

    var point: POI = await this.getPoi(pointId);

   var images: Image[] = []
    for(var i=0; i<object.paths.length; i++){

      console.log(object.paths[i])
      if(object.paths[i].substring(object.paths[i].length-3)== "mp4"){
        point.video = object.paths[i];
       
      }else{
      var image : Image = new Image()
      image.image = object.paths[i]
      image.title = object.names[i].name

      images.push(image)
      }

    }

    console.log("IMAGESSS")
    console.log(images)
    point.images = images;
    return await this.poiRepository.updateOne(pointId, point).catch(() => {
      throw new Error('Error updating poi');
    });
  }

  async updatePoi(pointId: string, data: Partial<POI>): Promise<POI> {
    return await this.poiRepository.updateOne(pointId, data).catch(err => {

      throw new Error('Error updating poi');
    });
  }

  async createPOI(poi: POI): Promise<POI> {
    return await this.poiRepository.createOne(poi).catch(() => {
      throw new CustomError(500, 'POI not created!');
    });
  }

  async uploadAudio(pointId: string, file: string): Promise<POI> {

    console.log("TUUUU" + pointId)
    console.log(await this.getPois())
    var point: POI = await this.getPoi(pointId);

    console.log("ehh")
    point.audio = file;
    return await this.poiRepository.updateOne(pointId, point).catch(() => {
      throw new Error('Error updating poi');
    });
  }

  async deletePOI(poiId: string) {


		var poi: POI = await this.getPoi(poiId).catch((err) => {
			throw new Error('Error getting poi');
		});

		await this.poiRepository.deleteOne({ _id: poiId }).catch((e) => {

			throw new CustomError(404, 'POI not deleted.');
		});
	}

}
