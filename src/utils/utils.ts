//import { ReturnLocation } from './../models/car/returnOptions';
import * as crypto from 'crypto';
//import * as jwt from 'jsonwebtoken';
//import * as _ from 'lodash';
//import * as moment from 'moment';
import { v4 } from 'uuid';
//import { CustomError } from '../classes/customError';
//import { INextFunction, IRequest, IResponse } from '../classes/interfaces';
//import UserRepo, { UserRepository } from '../db/repository/userRepository';
//import { Vehicle } from '../models/car/car';
//import { VehicleAvailable, VehicleStatus } from '../models/car/enums';
import { User, UserRoles, UserStatus } from '../models/user/user';
/*import { CONSTANTS } from './constants';
import { Tour } from '../models/tours/tour';
import { Booking } from '../models/booking/booking';*/
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

/*
export function hashPassword(password: string, salt: string): string {
	const iterations: number = 500;
	const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
	return key.toString('hex');
}

export function generateJwt(user: User): string {
	const secret = process.env.JWT_SECRET;
	const key = process.env.JWT_KEY;
	const tokenData = {
		id: user.id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		key: key,
		role: user.roleMB,
		status: user.statusMB,
		exp: Date.now() + CONSTANTS.day * 90
	};
	return jwt.sign(tokenData, secret);
}

export function mergeCopyArrays(objValue: any, srcValue: any): any {
	if (_.isArray(objValue)) return srcValue;
}

export function generatePasswordSalt(): any {
	return crypto.randomBytes(64).toString('hex');
}

export function generateRandomHex(size: number): string {
	return crypto.randomBytes(size).toString('hex');
}

export function generateRandomChars(n: number): any {
	let chars = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < n; i++)
		chars += possible.charAt(Math.floor(Math.random() * possible.length));

	return chars;
}


export interface IAuthChecker {
	check(id: any, role: string, req: IRequest): boolean;
}

export function paramCheck(param: string) {
	return function (id: any, req: any): any {
		return req.params[param] === id;
	};
}

export function queryCheck(param: string) {
	return function (id: any, req: any): any {
		return req.query[param] === id;
	};
}

export function bodyCheck(param: string) {
	return function (id: any, req: any): any {
		return req.body[param] === id;
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

export function formatDate(timestamp: number): string {
	return moment(timestamp).format('DD.MM.YYYY HH:mm');
}

export function formatDateDateOnly(timestamp: number): string {
	return moment(timestamp).format('DD.MM.YYYY');
}

export function formatDateHourOnly(timestamp: number): string {
	return moment(timestamp).format('HH:mm');
}

export function withErrorHandler(
	routerFunction: (req: IRequest, res: IResponse, next: INextFunction) => Promise<any>
) {
	return function (req: IRequest, res: IResponse, next: INextFunction): any {
		routerFunction(req, res, next).catch(next);
	};
}

export function deleteUndefinedFields(data: object): any {
	const undefinedFields: string[] = [];
	for (const key of Object.keys(data)) {
		if (
			typeof data[key] === 'undefined' ||
			data[key] === undefined ||
			data[key] == null ||
			(typeof data[key] === 'number' && isNaN(data[key]))
		)
			undefinedFields.push(key);
	}
	for (const key of undefinedFields) delete data[key];
}

export function flattenObject(obj: any): any {
	return flattenSingleObject(obj, {}, '');
}

function flattenSingleObject(obj: any, newObj: any, pathSoFar: any): any {
	for (const key of Object.keys(obj)) {
		if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] != null) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			for (const flatKey of Object.keys(obj[key]))
				flattenSingleObject(obj[key], newObj, pathSoFar + key + '.');
		} else newObj[pathSoFar + key] = obj[key];
	}
	return newObj;
}

export function thisYear(): number {
	return new Date().getFullYear();
}

export function createGeoLocationFilter(filter: any, path: string): void {
	path += '.geoLocation';
	filter[path] = {
		$nearSphere: {
			$geometry: {
				type: filter.geoLocation.type,
				coordinates: filter?.geoLocation?.coordinates
			},
			$maxDistance: filter.radius
		}
	};
	delete filter.geoLocation;
	delete filter.radius;
}

export function roundToOneDecimal(val: number): number {
	if (isNaN(val)) return null;
	return _.round(val, 1);
}

export function roundToTwoDecimal(val: number): number {
	if (isNaN(val)) return null;
	return _.round(val, 2);
}


export function capitalizeEvery(value: string): string {
	const splitVal = value.toLowerCase().split(' ');
	for (let i = 0; i < splitVal.length; i++) {
		splitVal[i] = splitVal[i].charAt(0).toUpperCase() + splitVal[i].substring(1);
	}
	return splitVal.join(' ');
}

export function isPhoneNum(value: string): boolean {
	if (!value) return false;
	value = onlyNum(value);
	if (value.startsWith('00')) value = value.replace('00', '');
	if (value.startsWith('0')) value = value.replace('0', '');

	const PATTERN = /^\+(?:[0-9]●?){6,14}[0-9]$/g;
	if (!PATTERN.test(`+${value.trim()}`)) {
		logger.error('ERR Phone: ' + value.trim());
		return false;
	}

	return true;
}

export function onlyNumChar(value: string): string {
	value = value.toLowerCase().replace(/[^\w]/g, '');
	if (!value) return '';
	return value.toUpperCase();
}

export function onlyNum(value: string): string {
	if (!value) return '';
	const PATTERN = /[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
	value = value.replace(PATTERN, '');
	value = value.replace(/\D/g, '');
	if (!value) return '';
	return capitalize(value.toLowerCase());
}

export function parseJwt(req: IRequest, res: IResponse, next: any): void {
	const token: string = req.header('accessToken');
	if (!token) return res.throwErr(new CustomError(401, 'No token'));
	let tokenData;
	try {
		tokenData = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		return res.throwErr(new CustomError(401, 'Invalid token'));
	}
	if (tokenData.exp < Date.now()) return res.throwErr(new CustomError(401, 'Token has expired'));

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

export function decodeJwtOrThrow(req: IRequest, res: IResponse): any {
	const token: string = req.header('accessToken');
	if (!token) return res.throwErr(new CustomError(401, 'No token'));
	let tokenData;
	try {
		tokenData = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		return res.throwErr(new CustomError(401, 'Invalid token'));
	}
	if (tokenData.exp < Date.now()) return res.throwErr(new CustomError(401, 'Token has expired'));
	return tokenData;
}

export function getExtKeys(): { name: string; key: string }[] {
	const extKeys: { name: string; key: string }[] = [];
	const arrKeys: string[] = process.env.EXT_KEYS.split(',');
	for (const key of arrKeys) {
		const splitKeys: string[] = key.split('@');
		extKeys.push({ name: splitKeys[0], key: splitKeys[1] });
	}
	return extKeys;
}


export function generateInviteCode(userName: string): string {
	if (!userName || !userName.trim()) {
		userName = Math.random().toString(16).substr(2, 6).trim();
	}
	if (userName.length > 5) userName = userName.trim().substring(0, 5);
	const inviteCode: string = onlyChar(userName) + Math.floor(99 + Math.random() * 900).toString();
	return inviteCode.toUpperCase();
}

export function chunkArray(array: any[], size: number): Array<any> {
	const chunked = [];
	let index = 0;
	while (index < array.length) {
		chunked.push(array.slice(index, size + index));
		index += size;
	}
	return chunked;
}

export function versionCompare(version: string, minVersion: string): boolean {
	if (typeof version + typeof minVersion !== 'stringstring') return false;

	const a = version.split('.');
	const b = minVersion.split('.');
	let i = 0;
	const len = Math.max(a.length, b.length);

	for (; i < len; i++) {
		if ((a[i] && !b[i] && parseInt(a[i]) > 0) || parseInt(a[i]) > parseInt(b[i])) return true;
		else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || parseInt(a[i]) < parseInt(b[i]))
			return false;
	}

	return true;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371e3;
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

export function getVehicleTourReadyFilter(
	tour: Tour,
	scannedVehicle: Vehicle,
	userId: string
): any {
	const filter: any = {} as any;
	filter.status = VehicleStatus.VERIFIED;
	filter.available = { $in: [VehicleAvailable.ONLINE, VehicleAvailable.TOUR_RESERVED] };
	filter['reservation.reservedBy'] = { $in: [null, userId] };

	filter.type = tour.vehicleType;
	filter['liveInfo.batteryPercentage'] = { $gte: 30 };

	filter['STG.enabled'] = true;
	filter['STG.tours.id'] = { $in: [tour.id] };

	if (scannedVehicle) {
		filter['liveInfo.lat'] = {
			$gte: scannedVehicle.liveInfo.lat - 0.001 / 2,
			$lte: scannedVehicle.liveInfo.lat + 0.001 / 2
		};
		filter['liveInfo.lon'] = {
			$gte: scannedVehicle.liveInfo.lon - 0.001 / 2,
			$lte: scannedVehicle.liveInfo.lon + 0.001 / 2
		};
	}

	return filter;
}

export function isCloseEnoughToReturn(
	location: { lat: number; lon: number },
	vehicle: Vehicle
): boolean {
	const returnLocations: ReturnLocation[] = vehicle?.returnOptions?.returnLoc;
	// for check device current location if near SPOT
	const isBelowOffset: any = el =>
		calculateDistance(el?.lat, el?.lon, location.lat, location.lon) < el?.offset;
	if (returnLocations.some(isBelowOffset)) {
		// device location is OK
		return true;
	} else {
		// for backup check vehicle current location if near SPOT
		const isBelowOffsetVeh: any = el =>
			calculateDistance(el?.lat, el?.lon, vehicle?.liveInfo?.lat, vehicle?.liveInfo?.lon) <
			el?.offset;
		if (returnLocations.some(isBelowOffsetVeh)) {
			// vehicle location is OK
			return true;
		} else {
			return false;
		}
	}
}

export function maskUserData(lastRents: Booking[], role: UserRoles): Booking[] {
	if ([UserRoles.ADMIN, UserRoles.SUPPORT, UserRoles.MANAGER].includes(role)) return lastRents;
	else {
		for (let i = 0; i < lastRents.length; i++) {
			lastRents[i].renter.firstName = lastRents[i].renter.firstName.charAt(0) + '*****';
			lastRents[i].renter.lastName = lastRents[i].renter.lastName.charAt(0) + '*****';
			lastRents[i].renter.email = lastRents[i].renter.email.charAt(0) + '*****';
			lastRents[i].renter.phone = lastRents[i].renter.phone.substring(0, 3) + '*******';
		}
		return lastRents;
	}
}
*/