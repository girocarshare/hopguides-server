import { Vehicle } from '../../models/vehicle/vehicle';
import { deserializeFromDb } from '../dbUtils';
import { MongoRepository } from './mongoRepository';

export class VehicleRepository extends MongoRepository<Vehicle> {
	constructor() {
		super();
	}

	mapObject(data: any): Vehicle {
		return deserializeFromDb(Vehicle, data);
	}
}

export default new VehicleRepository();
