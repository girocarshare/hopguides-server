import * as validator from 'validator';
import { isArray } from '../utils/utils';
import * as ErrorMessages from './errorMessages';
import { ErrorMessage } from './errorMessages';


export class EmailValidator implements Validator<string> {
	validate(value: string): ErrorMessage {
		return !value || validator.isEmail(value) ? null : ErrorMessages.email;
	}
}


export class MaxValidator implements Validator<any> {
	constructor(private max: number) {}

	validateNumber(value: number): any {
		return value <= this.max;
	}

	validate(value: any): ErrorMessage {
		if ((value || value === 0) && !this.validateNumber(isArray(value) ? value.length : value))
			return ErrorMessages.maxMsg(this.max);
	}
}

export interface Validator<T> {
	validate(value: T): ErrorMessage;
}

export class NopValidator implements Validator<any> {
	validate(value: any): ErrorMessage {
		return undefined;
	}
}
export class RequiredValidator implements Validator<any> {
	validate(value: any): ErrorMessage {
		if (typeof value === 'undefined' || value === undefined || value == null)
			return ErrorMessages.isRequired;
	}
}


export class EnumValidator implements Validator<any> {
	constructor(private enumClazz: any) {}

	validateString(value: string): any {
		return Object.keys(this.enumClazz).includes(value);
	}

	validate(value: any): ErrorMessage {
		if (value) {
			const valid = isArray(value)
				? value.every(v => this.validateString(v))
				: this.validateString(value);
			if (!valid) return ErrorMessages.enumMsg(this.enumClazz);
		}
	}
}

export class IntegerValidator implements Validator<any> {
	validate(value: any): ErrorMessage {
		if (value % 1 !== 0) return ErrorMessages.integerMsg;
	}
}


export class MinValidator implements Validator<any> {
	constructor(private min: number) {}

	validateNumber(value: number): any {
		return value >= this.min;
	}

	validate(value: any): ErrorMessage {
		if ((value || value === 0) && !this.validateNumber(isArray(value) ? value.length : value))
			return ErrorMessages.minMsg(this.min);
	}
}




export class NotEmptyValidator extends RequiredValidator {
	validate(value: any): ErrorMessage {
		const errorMsg = super.validate(value);
		if (errorMsg || (isArray(value) && value.length === 0) || value === '')
			return ErrorMessages.notEmpty;
	}
}
