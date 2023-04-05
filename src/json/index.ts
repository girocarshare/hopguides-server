import 'reflect-metadata';
import { CustomError } from '../classes/customError';
import {
  isArray,
  isPrimitive,
  nullValue,
  undefinedOrNullValue,
  undefinedValue,
} from '../utils/utils';
import type { JsonPropertyMetaData } from './decorations';
import { getJsonPropertiesMetaData } from './decorations';

export function deserialize<T>(Clazz: new () => T, jsonObject: any): T {
  if (nullValue(jsonObject)) return jsonObject;

  const obj = new Clazz();
  const jsonFields = getJsonPropertiesMetaData(obj);

  for (const field of jsonFields.filter((f) => f.deserialize)) {
    const type = Reflect.getMetadata('design:type', obj, field.propertyKey);
    const value = jsonObject[field.propertyKey];

    if (!undefinedValue(value)) {
      if (isPrimitive(type)) {
        if (!nullValue(value) && !isPrimitive(value)) {
          throw new CustomError(
            422,
            `Property (${field.propertyKey}) must be ${type} type.`,
          );
        }

        obj[field.propertyKey] = value;
      } else if (isArray(type)) {
        if (!nullValue(value)) {
          if (!isArray(value)) {
            throw new CustomError(
              422,
              `Property (${field.propertyKey}) must be array.`,
            );
          }

          if (!field.type) {
            throw new CustomError(
              500,
              `Property ${field.propertyKey} is array but class type on jsonProperty decoration is missing.`,
            );
          }

          if (isPrimitive(field.type)) obj[field.propertyKey] = value;
          else
            obj[field.propertyKey] = value.map((e) =>
              deserialize(field.type, e),
            );
        }
      } else {
        if (!nullValue(value) && (isPrimitive(value) || isArray(value))) {
          throw new CustomError(
            422,
            `Property (${field.propertyKey}) must be ${type.name} class.`,
          );
        }

        obj[field.propertyKey] = deserialize(type, value);
      }
    }
  }

  return obj;
}

export function serialize(obj: any, filter?: string): any {
  if (nullValue(obj)) return obj;

  const jsonFields: JsonPropertyMetaData[] = getJsonPropertiesMetaData(obj);

  const jsonObj = {};
  for (const field of jsonFields.filter((f) => f.serialize)) {
    const type = Reflect.getMetadata('design:type', obj, field.propertyKey);
    const value = obj[field.propertyKey];

    if (
      (!undefinedOrNullValue(value) || nullValue(value)) &&
      isFilterMatch(filter, field)
    ) {
      if (isPrimitive(type)) jsonObj[field.propertyKey] = value;
      else if (isArray(type)) {
        if (!field.type) {
          throw new CustomError(
            500,
            `Property ${field.propertyKey} is array but class type on jsonProperty decoration is missing.`,
          );
        }

        if (isPrimitive(field.type)) jsonObj[field.propertyKey] = value;
        else jsonObj[field.propertyKey] = value.map((e) => serialize(e));
      } else jsonObj[field.propertyKey] = serialize(value);
    }
  }

  return jsonObj;
}

function isFilterMatch(
  filter: string,
  jsonField: JsonPropertyMetaData,
): boolean {
  return !filter || !jsonField.filter || filter === jsonField.filter;
}
