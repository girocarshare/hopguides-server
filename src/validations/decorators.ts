import 'reflect-metadata';
import type { Validator } from './validators';
import {
  EmailValidator,
  MaxValidator,
  EnumValidator,
  IntegerValidator,
  MinValidator,
  NopValidator,
  NotEmptyValidator,
  RequiredValidator,
} from './validators';

const emailValidator = new EmailValidator();
const requiredValidator = new RequiredValidator();
const notEmptyValidator = new NotEmptyValidator();
const integerValidator = new IntegerValidator();
const nopValidator = new NopValidator();
export const validationsMDKey = Symbol('validations');
export const validationMethodsMDKey = Symbol('validationMethods');

export interface ValidationItem {
  propertyKey: string;
  validators: Validator<any>[];
}

interface ValidationMethodItem {
  errorMsg: string;
  validationFunction: Function;
}

function getProperValidationFromMetaData(
  target: any,
  propertyKey: string,
): ValidationItem {
  let validations = Reflect.getMetadata(validationsMDKey, target);
  if (!validations) {
    validations = [];
    Reflect.defineMetadata(validationsMDKey, validations, target);
  }

  let validation = validations.find((v) => v.propertyKey === propertyKey);
  if (!validation) {
    validation = { propertyKey, validators: [] };
    validations.push(validation);
  }

  return validation;
}

export function getValidationMethodMetaData(
  target: any,
): ValidationMethodItem[] {
  let validations: ValidationMethodItem[] = Reflect.getMetadata(
    validationMethodsMDKey,
    target,
  );
  if (!validations) {
    validations = [];
    Reflect.defineMetadata(validationMethodsMDKey, validations, target);
  }
  return validations;
}

function addValidator(
  target: any,
  propertyKey: string,
  validator: Validator<any>,
): any {
  const validation = getProperValidationFromMetaData(target, propertyKey);
  validation.validators.push(validator);
}

export function email(): any {
  return function (target: any, propertyKey: string): any {
    addValidator(target, propertyKey, emailValidator);
  };
}

export function max(max: number) {
  return function (target: any, propertyKey: string): any {
    addValidator(target, propertyKey, new MaxValidator(max));
  };
}

export function valid() {
  return function (target: any, propertyKey: string): any {
    addValidator(target, propertyKey, nopValidator);
  };
}

export function required(): any {
  return function (target: any, propertyKey: string): any {
    addValidator(target, propertyKey, requiredValidator);
  };
}

export function validEnum<T>(clazz: T) {
  return function (target: any, propertyKey: string): any {
    addValidator(target, propertyKey, new EnumValidator(clazz));
  };
}

export function integer() {
  return function (target: any, propertyKey: string): any {
    addValidator(target, propertyKey, integerValidator);
  };
}

export function min(min: number) {
  return function (target: any, propertyKey: string): any {
    addValidator(target, propertyKey, new MinValidator(min));
  };
}

export function notEmpty(): any {
  return function (target: any, propertyKey: string): any {
    addValidator(target, propertyKey, notEmptyValidator);
  };
}
