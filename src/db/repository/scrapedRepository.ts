
import { MongoRepository } from './mongoRepository';
import { deserializeFromDb } from '../dbUtils';
import { QRCodes } from '../../models/qrcodes/qrcodes';
import { Scraped } from '../../models/qrcodes/scraped';

export class ScrapedRepository extends MongoRepository<Scraped> {
	constructor() {
		super();
	}

	mapObject(data: any): Scraped {
		return deserializeFromDb(Scraped, data);
	}


}

export default new ScrapedRepository();

