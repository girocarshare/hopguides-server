import 'reflect-metadata';
import { fieldIdMDKey, getFieldDbMetaData } from './decorators';
import {
	isArray,
	isPrimitive,
	nullValue,
	undefinedOrNullValue,
	undefinedValue
} from '../utils/utils';
import { CustomError } from '../classes/customError';

export function setId(target: any, idValue: any): any {
	if (!undefinedOrNullValue(idValue)) {
		const fieldIdName = Reflect.getMetadata(fieldIdMDKey, target);
		if (fieldIdName) target[fieldIdName] = idValue;
	}
}

export function getId(target: any): any {
	const fieldIdName = Reflect.getMetadata(fieldIdMDKey, target);
	if (fieldIdName) return target[fieldIdName];
}

function getIdField(object: any): string {
	return Reflect.getMetadata(fieldIdMDKey, object);
}

function setIdOnObjectIfExists(object: any, dbObject: any): any {
	const fieldIdName: string = getIdField(object);
	if (fieldIdName) dbObject._id = object[fieldIdName];
}

export function serializeForDb(object: any): any {
	if (nullValue(object)) return object;

	const dbObject = {};
	setIdOnObjectIfExists(object, dbObject);

	const fieldDbs = getFieldDbMetaData(object);
	const idFieldName: string = getIdField(object);
	for (const field of fieldDbs) {
		if (field.propertyKey === idFieldName) continue;

		const type = Reflect.getMetadata('design:type', object, field.propertyKey);
		const value = object[field.propertyKey];

		if (!undefinedOrNullValue(value) || nullValue(value)) {
			if (isPrimitive(type)) dbObject[field.propertyKey] = value;
			else if (isArray(type)) {
				if (!field.type) {
					throw new CustomError(
						500,
						`Property ${field.propertyKey} is array but class type on fieldDb decoration is missing.`
					);
				}

				if (nullValue(value) || isPrimitive(field.type))
					dbObject[field.propertyKey] = value;
				else dbObject[field.propertyKey] = value.map(v => serializeForDb(v));
			} else dbObject[field.propertyKey] = serializeForDb(value);
		}
	}

	return dbObject;
}

export function deserializeFromDb<T>(Clazz: { new (): T }, dbObject: any): T {
	if (nullValue(dbObject)) return dbObject;

	const obj = new Clazz();
	const fieldDbs = getFieldDbMetaData(obj);

	for (const field of fieldDbs) {
		const type = Reflect.getMetadata('design:type', obj, field.propertyKey);
		const value = dbObject[field.propertyKey];

		if (!undefinedValue(value)) {
			if (isPrimitive(type)) obj[field.propertyKey] = value;
			else if (isArray(type)) {
				if (!nullValue(value)) {
					if (!field.type) {
						throw new CustomError(
							500,
							`Property ${field.propertyKey} is array but class type on fieldDb decoration is missing.`
						);
					}

					if (isPrimitive(field.type)) obj[field.propertyKey] = value;
					else {
						if (isArray(value)) {
							obj[field.propertyKey] = value.map(v =>
								deserializeFromDb(field.type, v)
							);
						}
					}
				}
			} else obj[field.propertyKey] = deserializeFromDb(type, value);
		}
	}

	setId(obj, dbObject._id);

	return obj;
}
