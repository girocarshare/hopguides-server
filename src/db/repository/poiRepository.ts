import { deserializeFromDb } from '../dbUtils';
import { POI } from '../../models/tours/poiModel';
import { MongoRepository } from './mongoRepository';

export class POIRepository extends MongoRepository<POI> {
  constructor() {
    super();
  }

  mapObject(data: any): POI {
    return deserializeFromDb(POI, data);
  }
}

export default new POIRepository();
