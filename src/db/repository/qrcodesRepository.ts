
import { MongoRepository } from './mongoRepository';
import { deserializeFromDb } from '../dbUtils';
import { QRCodes } from '../../models/qrcodes/qrcodes';

export class QrcodesRepository extends MongoRepository<QRCodes> {
	constructor() {
		super();
	}

	mapObject(data: any): QRCodes {
		return deserializeFromDb(QRCodes, data);
	}


}

export default new QrcodesRepository();

