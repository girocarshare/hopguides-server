import { User } from '../../models/user/user';
import { deserializeFromDb } from '../dbUtils';
import { MongoRepository } from './mongoRepository';

export class UserRepository extends MongoRepository<User> {
	constructor() {
		super();
	}

	mapObject(data: any): User {
		return deserializeFromDb(User, data);
	}
}

export default new UserRepository();
