import { deserializeFromDb } from '../dbUtils';
import { MongoRepository } from './mongoRepository';
import { Tour } from '../../models/tours/tour';
import { Library } from '../../models/library/library';

export class LibraryRepository extends MongoRepository<Library> {
	constructor() {
		super();
	}

	mapObject(data: any): Library {
		return deserializeFromDb(Library, data);
	}

}

export default new LibraryRepository();
