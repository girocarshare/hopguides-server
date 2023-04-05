import 'reflect-metadata';
import { undefinedOrNullValue } from '../utils/utils';

export const jsonPropertyMDKey = Symbol('jsonProperty');

export interface JsonPropertyParams {
  deserialize?: boolean;
  serialize?: boolean;
  type?: any;
  filter?: string;
}

export interface JsonPropertyMetaData extends JsonPropertyParams {
  propertyKey: string;
}

export function getJsonPropertiesMetaData(target: any): JsonPropertyMetaData[] {
  let jsonFields = Reflect.getMetadata(jsonPropertyMDKey, target);
  if (!jsonFields) jsonFields = [];
  // Reflect.defineMetadata(jsonPropertyMDKey, jsonFields, target);

  return jsonFields;
}

function getValueOrDefault(value: any, defaultValue: any): any {
  if (undefinedOrNullValue(value)) return defaultValue;

  return value;
}

export function jsonProperty(
  param: JsonPropertyParams = { deserialize: true, serialize: true },
): any {
  return function (target: any, propertyKey: string): any {
    const jsonFields = getJsonPropertiesMetaData(target).slice();
    jsonFields.push({
      propertyKey,
      deserialize: getValueOrDefault(param.deserialize, true),
      serialize: getValueOrDefault(param.serialize, true),
      type: param.type,
      filter: param.filter,
    });
    Reflect.defineMetadata(jsonPropertyMDKey, jsonFields, target);
  };
}
