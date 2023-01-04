import { Collection, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult } from 'mongodb';
import { CustomError } from '../../classes/customError';
import { SearchPagination } from '../../classes/searchPagination';
import { serializeForDb } from '../dbUtils';

export abstract class MongoRepository<T> {
	collection: Collection;

	protected constructor() { }

	abstract mapObject(data: any): T;

	setCollection(collection: Collection): void {
		this.collection = collection;
	}

	async getAll(filter?: any, pagination?: SearchPagination): Promise<T[]> {
		let searchOptions = {};
		if (pagination) searchOptions = pagination.buildMongoSearchOptions();
		const all: T[] = await this.collection.find(filter, searchOptions).toArray();
		return all.map(a => this.mapObject(a));
	}

	async getAllProject(filter?: any, projectOptions?: any): Promise<T[]> {
		const all: T[] = await this.collection
			.find(filter, {
				projection: projectOptions
			})
			.toArray();
		return all.map(a => this.mapObject(a));
	}

	/*async getAllWithSort(filter?: any, pagination?: SearchPagination, sort?: any): Promise<T[]> {
		let searchOptions = {};
		if (pagination) searchOptions = pagination.buildMongoSearchOptions();
		const all: T[] = await this.collection.find(filter, searchOptions).sort(sort).toArray();
		return all.map(a => this.mapObject(a));
	}
*/
	async getByIdOrThrow(id: string): Promise<T> {
		const found: any = await this.collection.findOne({ _id: id });
		if (!found) throw new CustomError(404, 'Not found');
		return this.mapObject(found);
	}

	async createOne(data: T): Promise<T> {
		const inserted: InsertOneWriteOpResult<any> = await this.collection.insertOne(
			serializeForDb(data)
		);
		return this.mapObject(inserted.ops[0]);
	}

	async createOneWithoutSerialization(data: any): Promise<any> {
		const inserted: InsertOneWriteOpResult<any> = await this.collection.insertOne(data);
		return this.mapObject(inserted.ops[0]);
	}

	async findOne(filter: Object): Promise<T> {
		const found = await this.collection.findOne(filter);
		if (!found) return null;
		return this.mapObject(found);
	}

	async replaceOne(id: string, data: any): Promise<T> {
		delete data.id;
		const replaceResult: any = await this.collection.replaceOne({ _id: id }, data);
		return this.mapObject(replaceResult.ops[0]);
	}

	async update(id: string, data: any): Promise<T> {
		delete data._id;
		const updated: FindAndModifyWriteOpResultObject<any> = await this.collection.findOneAndUpdate(
			{ _id: id },
			data,
			{ returnOriginal: false }
		);
		return this.mapObject(updated.value);
	}

	async updateOne(id: string, data: any): Promise<T> {
		delete data._id;
		const updated: FindAndModifyWriteOpResultObject<any> = await this.collection.findOneAndUpdate(
			{ _id: id },
			{ $set: data },
			{ returnOriginal: false }
		);
		return this.mapObject(updated.value);
	}

	async incrementOne(id: string, data: any): Promise<T> {
		delete data._id;
		const updated: FindAndModifyWriteOpResultObject<any> = await this.collection.findOneAndUpdate(
			{ _id: id },
			{ $inc: data },
			{ returnOriginal: false }
		);
		return this.mapObject(updated.value);
	}

	async count(filter?: any): Promise<number> {
		return await this.collection.countDocuments(filter, {});
	}

	async aggregateMap(aggregations: any[]): Promise<any> {
		const all: T[] = await this.collection.aggregate(aggregations).toArray();
		return all.map(a => this.mapObject(a));
	}

	async aggregate(aggregations: any[]): Promise<any> {
		return await this.collection.aggregate(aggregations).toArray();
	}

	async updateMany(filter: any, data: any): Promise<boolean> {
		const updated = await this.collection.updateMany(filter, { $set: data });
		return !!(updated.result && updated.result.ok);
	}

	async deleteMany(filter: any): Promise<boolean> {
		const updated = await this.collection.deleteMany(filter);
		return !!(updated.result && updated.result.ok);
	}

	async deleteOne(filter: any): Promise<boolean> {
		const updated = await this.collection.deleteOne(filter);
		return !!(updated.result && updated.result.ok);
	}
}
