import { deserializeFromDb } from '../dbUtils';
import { MongoRepository } from './mongoRepository';
import { POI } from '../../models/tours/poiModel';

export class POIRepository extends MongoRepository<POI> {
  constructor() {
    super();
  }

  mapObject(data: any): POI {
    return deserializeFromDb(POI, data);
  }
}

export default new POIRepository();
