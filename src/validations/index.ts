import { CustomError } from '../classes/customError';
import { isArray, isPrimitive, undefinedOrNullValue } from '../utils/utils';
import { getValidationMethodMetaData, validationsMDKey } from './decorators';

export function getNativeType(type: any): string {
	switch (type) {
		case String:
			return 'string';
		case Number:
			return 'number';
		case Boolean:
			return 'boolean';
	}
}

function validatePrimitiveType(
	value: any,
	type: any,
	propertyKey: string,
	errors: string[]
): string[] {
	// eslint-disable-next-line valid-typeof
	if (typeof value !== getNativeType(type)) {
		errors.push(
			`Property (${propertyKey}) with value (${value}) is not of type ${getNativeType(type)}.`
		);
	}
	return errors;
}

function validateObjectTypes(target: any): string[] {
	let errors: string[] = [];

	for (const propertyKey of Object.getOwnPropertyNames(target)) {
		const type = Reflect.getMetadata('design:type', target, propertyKey);
		const value = target[propertyKey];

		if (type && !undefinedOrNullValue(value) && isPrimitive(type))
			errors = validatePrimitiveType(value, type, propertyKey, errors);
	}
	return errors;
}

function validateSubclass(subObj: any, errors: string[]): string[] {
	// eslint-disable-next-line no-use-before-define
	const subClassErrors = validate(subObj);
	if (subClassErrors) errors = errors.concat(subClassErrors);

	return errors;
}

export function validate(target: any): string[] {
	let errors = validateObjectTypes(target);

	if (errors.length === 0) {
		const validations = Reflect.getMetadata(validationsMDKey, target) || [];
		for (const validation of validations) {
			const type = Reflect.getMetadata('design:type', target, validation.propertyKey);
			const value = target[validation.propertyKey];

			for (const validator of validation.validators) {
				const errorMessage = validator.validate(value);
				if (errorMessage) errors.push(errorMessage.printOut(validation.propertyKey, value));
			}

			if (!undefinedOrNullValue(value)) {
				if (isArray(type)) {
					value.map(v => {
						if (!isPrimitive(v)) errors = validateSubclass(v, errors);
					});
				} else if (!isPrimitive(type)) errors = validateSubclass(value, errors);
			}
		}
		if (errors.length === 0) {
			const validationMethods = getValidationMethodMetaData(target);
			for (const validationMethod of validationMethods) {
				const validationFunction = validationMethod.validationFunction.bind(target);
				const valid = validationFunction();
				if (!valid) errors.push(validationMethod.errorMsg);
			}
		}
	}

	if (errors.length > 0) return errors;
}

export function validateOrThrow(target: any): void {
	const errorMsg = validate(target);
	if (errorMsg) {
		console.error('Test', errorMsg.join(' '));
		throw new CustomError(422, errorMsg.join(' '));
	}
}
