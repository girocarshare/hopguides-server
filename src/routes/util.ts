//import * as jwt from 'jsonwebtoken';
import { INextFunction, IRequest, IResponse } from '../classes/interfaces';
import { CustomError } from '../classes/customError';
/*import UserRepo from '../../db/repository/userRepository';
import { UserStatus, UserRoles } from '../../models/user/user';
import { Vehicle } from '../../models/car/car';
import blacklistRepo, { BlacklistRepository } from '../../db/repository/blacklistRepository';
const geoip = require('geoip-lite');*/

// todo : move away from here

// todo : refactor all this
/*export function userSecurity() {
	return (req: IRequest, res: IResponse, next: INextFunction): void => {
		// Standard Token check
		const token: string = req.header('accessToken');
		if (!token) return res.throwErr(new CustomError(401, 'No token'));
		let tokenData;
		try {
			tokenData = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return res.throwErr(new CustomError(401, 'Invalid token'));
		}
		if (tokenData.exp < Date.now()) {
			return res.throwErr(new CustomError(401, 'Token has expired'));
		}

		// Token check
		// We should allow any user role to use the APP
		if (
			tokenData.role !== UserRoles.ROOT &&
			tokenData.role !== UserRoles.ADMIN &&
			tokenData.role !== UserRoles.SUPPORT &&
			tokenData.role !== UserRoles.SERVICE &&
			tokenData.role !== UserRoles.MANAGER &&
			tokenData.role !== UserRoles.MARKETING &&
			tokenData.role !== UserRoles.USER
		) {
			return res.throwErr(new CustomError(403, 'Unauthorized'));
		}

		// User extraction
		UserRepo.getByIdOrThrow(tokenData.id)
			.then(u => {
				// Context checks
				if (u.statusMB === UserStatus.BANNED)
					return res.throwErr(new CustomError(401, 'Banned'));

				// todo : maybe use this too but not in /terms case that is exception
				// if (u.statusMB !== UserStatus.VERIFIED)
				// 	throw new CustomError(401, 'Error with owner profile data');

				// Inject auth data
				req.userId = tokenData.id;
				req.role = tokenData.role;
				req.user = u;
				next();
			})
			.catch(_ => {
				// If we are here the user is not present in DB
				// We shall throw 401 (to cause APP logout) APCR
				res.throwErr(new CustomError(401, 'No user'));
			});
	};
}
*/
// todo : refactor all this
export function simpleAsync<
	TI = IRequest,
	TO extends IResponse = IResponse,
	TN extends INextFunction = INextFunction
>(routerFunction: (req: TI, res: TO) => Promise<any>) {
	return function (req: TI, res: TO, next: TN): any {
		routerFunction(req, res)
			.then(x => res.status(200).send(x))
			// todo : there are functions throwing and other functions using
			//        res.throwError(), all this stuff is not clear
			.catch(err => {
				if (err instanceof CustomError) res.throwErr(err);
				else next(err);
			});
	};
}
/*
export function simpleMiddleware<
	TI = IRequest,
	TO extends IResponse = IResponse,
	TN extends INextFunction = INextFunction
>(mwFunction: (req: TI, res: TO) => Promise<any>) {
	return function (req: TI, res: TO, next: TN): any {
		mwFunction(req, res)
			.then(_ => next())
			// todo : there are functions throwing and other functions using
			//        res.throwError(), all this stuff is not clear
			.catch(err => {
				if (err instanceof CustomError) res.throwErr(err);
				else next(err);
			});
	};
}

// todo : use something that is not hardcoded
//        but for sure not on the front end
export function reservedVehicleAdditionalData(v: Vehicle): Vehicle {
	if (v && v.reservation) {
		const r = v.reservation as any;
		// Compute reservation time
		if (r.reservedAt) {
			r.expiresAt = r.reservedAt + 900000;
			r.expiresIn = r.expiresAt - Date.now();
		}
	}
	return v;
}

// REGION PARSING

export interface MapRegion {
	lat: number;
	lon: number;
	latDelta: number;
	lonDelta: number;
}

const REGEX_REGION = /^(\d+(?:.\d+)?)x(\d+(?:.\d+)?),(\d+(?:.\d+)?)x(\d+(?:.\d+)?)$/;

export function parseRegionString(regionString: string): MapRegion | null {
	const match = REGEX_REGION.exec(regionString);
	if (!match) return null;
	// Parse region
	const region: MapRegion = {
		lat: parseFloat(match[1]),
		lon: parseFloat(match[2]),
		latDelta: parseFloat(match[3]),
		lonDelta: parseFloat(match[4])
	};
	// Check
	if (
		isNaN(region.lat) ||
		isNaN(region.lon) ||
		isNaN(region.latDelta) ||
		isNaN(region.lonDelta)
	) {
		return null;
	}
	// Return
	return region;
}

export function parseUserLocale() {
	return (req: IRequest, res: IResponse, next: INextFunction): void => {
		const locale: string = req.header('Accept-Language')?.toLowerCase() || 'en';
		req.locale = locale;
		next();
	};
}

export function checkAppOrigin() {
	return (req: IRequest, res: IResponse, next: INextFunction): void => {
		const token: string = req.bearerToken;
		if (!token) {
			console.error('NO TOKEN IN REQUEST');
			return res.throwErr(new CustomError(401, 'No token'));
		}

		if (token !== process.env.APP_TOKEN) {
			console.error('TOKEN NOT VALID');
			return res.throwErr(new CustomError(401, 'Unauthorized'));
		}
		next();
	};
}

export function checkBlacklisted() {
	return (req: IRequest, res: IResponse, next: INextFunction): void => {
		// blacklist extraction
		blacklistRepo
			.findOne({ ip: req.ip })
			.then(entry => {
				if (entry.blacklisted === true && req?.body?.phone !== '+14084766514') {
					console.error('BLACKLISTED');
					return res.throwErr(new CustomError(401, 'Unauthorized'));
				} else next();
			})
			.catch(_ => {
				next();
			});
	};
}

export function checkGeoIP() {
	return (req: IRequest, res: IResponse, next: INextFunction): void => {
		const data = geoip.lookup(req.ip);
		// if (['AT', 'SI', 'HR'].includes(data.country) || req?.body?.phone == '+14084766514') {
			next();
		// } else {
			// return res.throwErr(new CustomError(403, 'Unauthorized'));
		// }
	};
}

export function translateVehicleSTG(vehicle: Vehicle, locale: string = 'en'): Vehicle {
	if (!vehicle.STG.enabled) return vehicle;
	else {
		for (let i = 0; i < vehicle.STG.tours.length; i++) {
			vehicle.STG.tours[i].title = vehicle.STG.tours[i].title[locale];
			vehicle.STG.tours[i].shortInfo = vehicle.STG.tours[i].shortInfo[locale];
		}
		return vehicle;
	}
}*/
