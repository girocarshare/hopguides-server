import 'reflect-metadata';

export const fieldIdMDKey = Symbol('fieldId');
export const fieldColumnMDKey = Symbol('filedColumn');

export function id(): any {
	return function (target: any, propertyKey: string): any {
		Reflect.defineMetadata(fieldIdMDKey, propertyKey, target);
	};
}
export interface FieldDbParams {
	type?: any;
}

export interface FieldDbMetaData {
	propertyKey: string;
	type?: any;
}

export function getFieldDbMetaData(target: any): FieldDbMetaData[] {
	let columnFields = Reflect.getMetadata(fieldColumnMDKey, target);
	if (!columnFields) columnFields = [];
	// Reflect.defineMetadata(fieldColumnMDKey, columnFields, target);

	return columnFields;
}

export function dbField(param: FieldDbParams = { type: null }): any {
	return function (target: any, propertyKey: string): any {
		const fieldDbs = getFieldDbMetaData(target).slice();

		const fieldDbParam: FieldDbMetaData = { propertyKey };
		if (param && param.type) fieldDbParam.type = param.type;

		fieldDbs.push(fieldDbParam);
		Reflect.defineMetadata(fieldColumnMDKey, fieldDbs, target);
	};
}
