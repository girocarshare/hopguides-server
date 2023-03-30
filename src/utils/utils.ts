
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import { CustomError } from '../classes/customError';
import { INextFunction, IRequest, IResponse } from '../classes/interfaces';
import UserRepo, { UserRepository } from '../db/repository/userRepository';
import { User, UserRoles, UserStatus } from '../models/user/user';
import { CONSTANTS } from './constants';
import { Logger } from 'tslog';

const logger: Logger = new Logger();

export function undefinedOrNullValue(value: any): boolean {
	return undefinedValue(value) || nullValue(value);
}

export function undefinedValue(value: any): any {
	return typeof value === 'undefined' || value === undefined;
}

export function nullValue(value: any): boolean {
	return value === null;
}

export function isArray(object: any): any {
	if (object === Array) return true;
	else if (typeof Array.isArray === 'function') return Array.isArray(object);
	else return object instanceof Array;
}

export function eighteenYearsOld(): number {
	const now: Date = new Date();
	return new Date().setFullYear(now.getFullYear() - 18);
}

export function generateUuid(): string {
	return v4();
}

export function generateVehicleIMEI(text?: string): string {
	const vehicleIMEI: string =
		'#' + onlyChar(text) + Math.floor(100000 + Math.random() * 900000).toString();
	return vehicleIMEI.toUpperCase();
}

export function onlyChar(value: string): string {
	if (!value) return '';
	const PATTERN = /[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
	value = value.replace(PATTERN, '');
	value = value.replace(/[0-9]/g, '');
	if (!value) return '';
	return capitalize(value.toLowerCase());
}

export function capitalize(value: string): string {
	value = value.toLowerCase();
	if (!value) return '';
	return value[0].toUpperCase() + value.slice(1);
}


export function generateRideCode(): string {
	let chars = '';
	const possible = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
	for (let i = 0; i < 8; i++) {
		chars += possible.charAt(Math.floor(Math.random() * possible.length));
		if (chars.length === 4) chars += '-';
	}
	return chars;
}

export function isPrimitive(obj: any): any {
	switch (typeof obj) {
		case 'string':
		case 'number':
		case 'boolean':
			return true;
	}

	return obj === String || obj === Number || obj === Boolean;
}

export function withErrorHandler(
	routerFunction: (req: IRequest, res: IResponse, next: INextFunction) => Promise<any>
) {
	return function (req: IRequest, res: IResponse, next: INextFunction): any {
		routerFunction(req, res, next).catch();
	};
}
export function generateRandomHex(size: number): string {
	return crypto.randomBytes(size).toString('hex');
}

var JWT_KEY="73c0f68d35b4fc866d54"
var JWT_SECRET="jj8axcJBhpQqZm08O5HxGxpSH9XLmQFhXYbPmt6wnG8B4Q92N98zSPmJrgtceOi"

export function generateJwt(user: User): string {
	const secret = JWT_SECRET;
	const key = JWT_KEY;
	const tokenData = {
		id: user.id,
		exp: Date.now() + CONSTANTS.day * 90
	};
	return jwt.sign(tokenData, secret);
}

export interface IAuthChecker {
	check(id: any, role: string, req: IRequest): boolean;
}

export function paramCheck(param: string) {
	return function (id: any, req: any): any {
		return req.params[param] === id;
	};
}

class RoleChecker implements IAuthChecker {
	constructor(private readonly role: string) {}

	check(id: any, role: string, req: IRequest): boolean {
		return role === this.role;
	}
}

class RoleAndIdChecker extends RoleChecker {
	constructor(role: string, private readonly idChecker: (id, req) => boolean) {
		super(role);
		this.idChecker = idChecker;
	}

	check(id: any, role: string, req: IRequest): boolean {
		return super.check(id, role, req) && (!this.idChecker || this.idChecker(id, req));
	}
}

export const AdminRole = new RoleChecker('ADMIN');
export const MarketingRole = new RoleChecker('MARKETING');
export const SupportRole = new RoleChecker('SUPPORT');
export const ServiceRole = new RoleChecker('SERVICE');
export const ManagerRole = new RoleChecker('MANAGER');
export const UserRole = new RoleChecker('USER');
export const UserRoleWith = (idChecker: (id, req) => boolean): any =>
	new RoleAndIdChecker('USER', idChecker);

export function allowFor(
	rules: IAuthChecker[]
): (req: IRequest, res: IResponse, next: INextFunction) => void {
	return function (req: IRequest, res: IResponse, next: INextFunction): any {
		const token: string = req.header('accessToken');
		if (!token) return res.throwErr(new CustomError(401, 'No token'));
		let tokenData;
		try {
			tokenData = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return res.throwErr(new CustomError(401, 'Invalid token'));
		}
		if (tokenData.exp < Date.now())
			return res.throwErr(new CustomError(401, 'Token has expired'));

		const authorized = rules.some(r => r.check(tokenData.id, tokenData.role, req));
		if (!authorized) return res.throwErr(new CustomError(403, 'Unauthorized'));

		const userRepository: UserRepository = UserRepo;
		userRepository
			.getByIdOrThrow(tokenData.id)
			.then(u => {
				if (u.statusMB === UserStatus.BANNED)
					return res.throwErr(new CustomError(401, 'Banned'));
				req.userId = tokenData.id;
				req.role = tokenData.role;
				next();
			})
			.catch(() => res.throwErr(new CustomError(403, 'Unauthorized')));
	};
}

var JWT_SECRET="jj8axcJBhpQqZm08O5HxGxpSH9XLmQFhXYbPmt6wnG8B4Q92N98zSPmJrgtceOi"

export function parseJwt(req: IRequest, res: IResponse, next: any): void {


	var token = ""
	if(req.route.methods.get == true){
		 token = req.header('authorization').replace('Bearer ', '').trim()
	}else{
		 token = req.body.headers.authorization.trim()
	}
	
	//var token = req.body.headers.authorization.trim()
	if (!token) return res.throwErr(new CustomError(401, 'No token'));
	let tokenData;
	try {
		tokenData = jwt.verify(token, JWT_SECRET);
	} catch (err) {
		return res.throwErr(new CustomError(401, 'Invalid token'));
	}
	//if (tokenData.exp < Date.now()) return res.throwErr(new CustomError(401, 'Token has expired'));

	const userRepository: UserRepository = UserRepo;
	userRepository
		.getByIdOrThrow(tokenData.id)
		.then(u => {
			if (u.statusMB === UserStatus.BANNED)
				return res.throwErr(new CustomError(401, 'Banned'));
			req.userId = tokenData.id;
			req.role = tokenData.role;
			next();
		})
		.catch(() => res.throwErr(new CustomError(403, 'Unauthorized')));
}
