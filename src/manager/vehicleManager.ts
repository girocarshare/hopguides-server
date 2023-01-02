//import * as _ from 'lodash';
//import { LocationPoint } from './../models/geofence/location';
/* eslint-disable indent   */
import { CreateVehiclePayload } from '../classes/vehicle/createVehiclePayload';
import { CustomError } from '../classes/customError';
//import { GetVehiclePayload } from '../classes/car/getVehiclePayload';
import VehicleRepo, { VehicleRepository } from '../db/repository/vehicleRepository';
import { deserialize } from '../json';
import { Vehicle } from '../models/vehicle/vehicle';
import {
	//BikePowerCommand,
	LockStatus,
	//PowerCommand,
	//PowerDirection,
	VehicleAvailable,
	VehicleStatus,
	VehicleType,
	VehicleVersion
} from '../models/vehicle/enums';/*
import { S3Service } from '../utils/s3Service';
import { SearchPagination } from '../classes/searchPagination';
import { SearchCarQueryPayload } from '../classes/car/searchCarQueryPayload';
import { PatchVehicleAdminPayload } from '../classes/car/patchVehicleAdminPayload';
import { PatchVehiclePayload } from '../classes/car/patchVehiclePayload';
import { User, UserRoles } from '../models/user/user';
import { validateOrThrow } from '../validations';
import { deleteUndefinedFields, getVehicleTourReadyFilter } from '../utils/utils';
import { serializeForDb } from '../db/dbUtils';
import { PatchTrackerPayload } from '../classes/car/trackerPatchPayload';
import {
	editTracker,
	addTracker,
	delTracker,
	unlockBluetoothLock,
	lookFor,
	clearOldTrackerData,
	resetIoT,
	setAlarm,
	clearVehicleCommandsQueue,
	retrievePathApi,
	bikePC,
	scooterPC
} from '../utils/iot/iotApi';
import isPointWithinRadius from 'geolib/es/isPointWithinRadius';
import { Type } from '../models/geofence/geofence';
import { Booking } from '../models/booking/booking';
import { BookingManager } from './bookingManager';
import { UserManager } from './userManager';
import { UserBasicPayload } from '../classes/user/userBasicPayload';
import { GetGeofencePayload } from '../classes/geofence/getGeofencePayload';
import { GeofenceManager } from './geofenceManager';
import { SortOrder } from '../classes/enums';*/
import { VehicleLiveInfo } from '../models/vehicle/LiveInfo';
/*import { PathPoint } from '../models/booking/PathPoint';
import { Tour } from '../models/tours/tour';
import { FMB120 } from '../models/car/trackers/FMB120';
import { OperStats } from '../models/operStats/operStats';
import * as moment from 'moment';  */
export class VehicleManager {
	vehicleRepository: VehicleRepository;
	//geofenceManager: GeofenceManager;
	//s3Service: S3Service;

	constructor() {
		this.vehicleRepository = VehicleRepo;
		//this.geofenceManager = new GeofenceManager();
		//this.s3Service = new S3Service(process.env.AWS_BUCKET_NAME);
	}

	/**
	 * Creates a car
	 * @param {string} userId
	 * @param vehicleData
	   */

	async createVehicle(vehicle: Vehicle): Promise<Vehicle> {
		return await this.vehicleRepository.createOne(vehicle).catch(() => {
			throw new CustomError(500, 'Vehicle not created!');
		});
	}

	async create(userId: string, vehicleData: CreateVehiclePayload): Promise<Vehicle> {
		const payload: Vehicle = deserialize(Vehicle, vehicleData);
		//payload.userId = userId;
		payload.liveInfo = new VehicleLiveInfo();

		const vehicle: Vehicle = await this.vehicleRepository.createOne(payload).catch(() => {
			throw new Error('Error creating a Vehicle');
		});

		/*switch (vehicle.version) {
			case VehicleVersion.FMB120:
				await this.addVehicleTracker(vehicle);
				break;
			case VehicleVersion.TST100:
				await this.addVehicleTracker(vehicle);
				break;
			default:
				// do nothing vehicle has no tracker
				break;
		}*/
		return vehicle;
	}

	/**
	 * Gets all the vehicles in database
	   
	/*async getVehiclesQuery(
		filter?: SearchCarQueryPayload,
		pagination?: SearchPagination
	): Promise<Vehicle[]> {
		return await this.vehicleRepository
			.getAllWithSort(filter, pagination, { 'liveInfo.batteryPercentage': 1, IMEI: 1 })
			.catch(() => {
				throw new Error('Error getting all Vehicles with query');
			});
	}

	async getVehicles(filter?: any): Promise<Vehicle[]> {
		return await this.vehicleRepository.getAll(filter).catch(() => {
			throw new Error('Error getting all Vehicles');
		});
	}

	/**
	 * Counts all the vehicles in database
	   
	async countVehicles(filter?: any): Promise<number> {
		return await this.vehicleRepository.count(filter).catch(() => {
			throw new Error('Error counting Vehicles');
		});
	}

	/**
	 * Gets the vehicle with specified id
	 * @param vehicleId
	   
	async getVehicle(vehicleId: string): Promise<Vehicle> {
		return await this.vehicleRepository.getByIdOrThrow(vehicleId).catch(() => {
			throw new Error('Error getting this Vehicle');
		});
	}

	async getVehicleByTrackerIMEI(trackerIMEI: string): Promise<Vehicle> {
		const filter: any = {
			'trackerInfo.trackerIMEI': trackerIMEI
		};
		return await this.vehicleRepository.findOne(filter).catch(() => {
			throw new Error('Error getting Vehicle');
		});
	}

	/**
	 * Counts all the vehicles of user in database
	   
	async getUserVehicles(filter: any, pagination?: SearchPagination): Promise<Vehicle[]> {
		return await this.vehicleRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting user Vehicles');
		});
	}

	/**
	 * Gets the vehicle with specified QR code
	 * @param codeIMEI
	   
	async getVehicleByIMEI(codeIMEI: string, locale: string = 'en'): Promise<any> {
		let sign: string = '#';
		if (
			process.env.ENV !== 'prod' &&
			(codeIMEI.startsWith('999') || codeIMEI.startsWith('420') || codeIMEI.startsWith('199'))
		) {
			sign = '$';
		}
		if (
			process.env.ENV === 'prod' &&
			(codeIMEI.startsWith('123') || codeIMEI.startsWith('200'))
		) {
			sign = '$';
		}
		const filter: any = {
			IMEI: sign + codeIMEI,
			status: VehicleStatus.VERIFIED,
			available: {
				$in: [
					VehicleAvailable.ONLINE,
					VehicleAvailable.RESERVED,
					VehicleAvailable.TOUR_RESERVED,
					VehicleAvailable.DRIVING
				]
			},
			'liveInfo.lockStatus': { $in: [LockStatus.LOCKED, LockStatus.UNLOCKED] }
		};
		const vehicle = deserialize(
			GetVehiclePayload,
			await this.vehicleRepository.findOne(filter).catch(() => {
				throw new Error('Error getting Vehicle');
			})
		);
		if (vehicle?.STG) vehicle.translateSTG(locale);
		return vehicle;
	}

	/**
	 * Gets the vehicle with specified QR code
	 * @param codeIMEI
	   
	async getVehicleByIMEIServicers(codeIMEI: string): Promise<Vehicle> {
		const filter: any = {
			IMEI: '#' + codeIMEI
		};
		return await this.vehicleRepository.findOne(filter).catch(() => {
			throw new Error('Error getting Vehicle');
		});
	}

	async getReservedVehicle(userId: string): Promise<Vehicle> {
		// todo : this filter shall be fixed
		// reservedVehicle.available === VehicleAvailable.RESERVED
		const filter: any = { 'reservation.reservedBy': userId };
		return await this.vehicleRepository.findOne(filter).catch(() => {
			throw new Error('Error getting this Vehicle');
		});
	}

	/**
	 * Update the vehicle
	   
	async updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
		return await this.vehicleRepository.updateOne(vehicleId, vehicleData).catch(() => {
			throw new Error('Error updating Vehicle');
		});
	}

	async updateVehicles(filter: any, data: Partial<Vehicle>): Promise<boolean> {
		return await this.vehicleRepository.updateMany(filter, data).catch(() => {
			throw new Error('Error updating Vehicles');
		});
	}

	/**
	 * Delete the vehicle
	   
	async deleteCar(vehicle: Vehicle): Promise<Vehicle> {
		const updateData: any = { status: VehicleStatus.DELETED };
		switch (vehicle.version) {
			case VehicleVersion.FMB120:
				await editTracker(
					vehicle?.id,
					vehicle?.trackerInfo?.trackerIMEI,
					deserialize(PatchTrackerPayload, { status: 0 })
				);
				break;
			case VehicleVersion.TST100:
				await editTracker(
					vehicle?.id,
					vehicle?.trackerInfo?.trackerIMEI,
					deserialize(PatchTrackerPayload, { status: 0 })
				);
				break;
			default:
				// do nothing
				break;
		}
		return await this.vehicleRepository.updateOne(vehicle.id, updateData).catch(() => {
			throw new Error('Error deleting Vehicle');
		});
	}

	/**
	 * Gets all available vehicles in radius in location
	 * @param location
	 * @param radius
	   
	/*async getVehicleInRadius(
		location: LocationPoint,
		radius: any,
		user?: User
	): Promise<GetVehiclePayload[]> {
		// todo : this is badly inefficient
		const vehicles: Vehicle[] = await this.vehicleRepository.getAll().catch(() => {
			throw new Error('Error getting Vehicles');
		});
		const vehiclesInRange: GetVehiclePayload[] = [];
		for (const vehicle of vehicles) {
			if (
				vehicle?.private?.phoneList?.length > 0 ||
				vehicle?.private?.domainList?.length > 0
			) {
				if (
					vehicle?.private?.phoneList.indexOf(user.phone) < 0 &&
					vehicle?.private?.domainList.indexOf(
						user?.email.substr(user?.email.indexOf('@'))
					) < 0
				) {
					continue;
				}
			}

			if (
				isPointWithinRadius(
					{ latitude: vehicle?.liveInfo?.lat, longitude: vehicle?.liveInfo?.lon },
					{ latitude: location.latitude, longitude: location.longitude },
					radius
				) &&
				(vehicle?.available === VehicleAvailable.ONLINE ||
					vehicle?.available === VehicleAvailable.RESERVED) &&
				vehicle?.status === VehicleStatus.VERIFIED &&
				vehicle?.liveInfo?.lockStatus === LockStatus.LOCKED
			) {
				vehiclesInRange.push(deserialize(GetVehiclePayload, vehicle));
			}
		}

		return vehiclesInRange;
	}

	/**
	 * Gets all the vehicles in a specified region
	 * @param lat ~ center latitude
	 * @param lon ~ center longitude
	 * @param latD ~ region latitude width
	 * @param lonD ~ region longitude width
	 * @param limit ~ max number of results
	 
	async getVehicleInRegion(
		lat: number,
		lon: number,
		latD: number,
		lonD: number,
		user?: User,
		limit: number = -1,
		locale: string = 'en'
	): Promise<any[]> {
		// todo : add indexes
		const cursor = await this.vehicleRepository.collection.find<Vehicle>({
			'liveInfo.lat': { $gte: lat - latD / 2, $lte: lat + latD / 2 },
			'liveInfo.lon': { $gte: lon - lonD / 2, $lte: lon + lonD / 2 },
			'liveInfo.batteryPercentage': { $gt: 10 },
			'liveInfo.lockStatus': 'LOCKED',
			status: 'VERIFIED',
			available: { $in: ['ONLINE', 'RESERVED'] }
		});
		const vehicles: Vehicle[] = await (limit >= 0 ? cursor.limit(limit) : cursor).toArray();
		// todo : here id is returned as `_id`
		return vehicles
			.filter(vehicle =>
				vehicle?.private?.phoneList?.length > 0 || vehicle?.private?.domainList?.length > 0
					? vehicle?.private?.phoneList.indexOf(user.phone) > -1 ||
					  vehicle?.private?.domainList.indexOf(
							user?.email.substr(user?.email.indexOf('@'))
					  ) > -1
					: true
			)
			.map(i => {
				i.id = (i as any)._id;
				const data = deserialize(GetVehiclePayload, i);
				if (data.STG) data.translateSTG(locale);
				return data;
			});
	}

	/**
	 * Gets all the vehicles in a specified region
	 * @param lat ~ center latitude
	 * @param lon ~ center longitude
	 * @param latD ~ region latitude width
	 * @param lonD ~ region longitude width
	 * @param limit ~ max number of results
	 
	async getVehicleInRegionPublic(
		lat: number,
		lon: number,
		latD: number,
		lonD: number,
		limit: number = -1
	): Promise<GetVehiclePayload[]> {
		// todo : add indexes
		const cursor = await this.vehicleRepository.collection.find<Vehicle>({
			'liveInfo.lat': { $gte: lat - latD / 2, $lte: lat + latD / 2 },
			'liveInfo.lon': { $gte: lon - lonD / 2, $lte: lon + lonD / 2 },
			'liveInfo.batteryPercentage': { $gt: 10 },
			'liveInfo.lockStatus': 'LOCKED',
			status: 'VERIFIED',
			available: { $in: ['ONLINE', 'RESERVED'] }
		});
		const vehicles: Vehicle[] = await (limit >= 0 ? cursor.limit(limit) : cursor).toArray();
		// todo : here id is returned as `_id`
		return vehicles
			.filter(
				vehicle =>
					!(vehicle?.private?.phoneList?.length > 0) &&
					!(vehicle?.private?.domainList?.length > 0)
			)
			.map(i => {
				i.id = (i as any)._id;
				return deserialize(GetVehiclePayload, i);
			});
	}
  
	/**
	 * Patch the vehicle
	   
	async patchVehicle(
		user: User,
		vehicle: Vehicle,
		role: UserRoles,
		vehicleData: any
	): Promise<Vehicle> {
		const updateData: PatchVehiclePayload =
			role === UserRoles.ADMIN
				? deserialize(PatchVehicleAdminPayload, vehicleData)
				: deserialize(PatchVehiclePayload, vehicleData);
		validateOrThrow(updateData);
		deleteUndefinedFields(updateData);
		if (
			vehicle.status !== VehicleStatus.VERIFIED &&
			updateData.status === VehicleStatus.VERIFIED
		) {
			updateData.alertsEnabled = true;
		}
		updateData.modifiedAt = Date.now();
		updateData['changeLog.changedBy'] = user.id;
		updateData['changeLog.changedAt'] = Date.now();

		return await this.vehicleRepository
			.updateOne(vehicle.id, serializeForDb(updateData))
			.catch(() => {
				throw new CustomError(412, 'Error updating Vehicle');
			});
	}

	async getManagers(vehicleId: string): Promise<User[]> {
		const aggregateFilter: any[] = [];
		aggregateFilter.push({
			$match: {
				_id: vehicleId
			}
		});
		aggregateFilter.push({
			$lookup: {
				from: 'users',
				localField: 'maintainedBy.managers',
				foreignField: '_id',
				as: 'managers'
			}
		});
		aggregateFilter.push({ $unwind: '$managers' });
		aggregateFilter.push({
			$match: {
				'managers.roleMB': UserRoles.MANAGER
			}
		});
		aggregateFilter.push({
			$project: { managers: 1, _id: 0 }
		});
		const aggregatedArray: any[] = await this.vehicleRepository
			.aggregate(aggregateFilter)
			.catch(() => {
				throw new Error('Error getting all Managers');
			});

		if (!aggregatedArray[0]) {
			return [];
		}
		return [aggregatedArray[0].managers];
	}

	async getServicers(vehicleId: string): Promise<User[]> {
		const aggregateFilter: any[] = [];
		aggregateFilter.push({
			$match: {
				_id: vehicleId
			}
		});
		aggregateFilter.push({
			$lookup: {
				from: 'users',
				localField: 'maintainedBy.servicers',
				foreignField: '_id',
				as: 'servicers'
			}
		});
		aggregateFilter.push({
			$match: {
				'servicers.roleMB': UserRoles.SERVICE
			}
		});
		aggregateFilter.push({
			$project: { servicers: 1, _id: 0 }
		});
		const aggregatedArray: any[] = await this.vehicleRepository
			.aggregate(aggregateFilter)
			.catch(() => {
				throw new Error('Error getting all Servicers');
			});

		if (!aggregatedArray[0]) {
			return [];
		}
		return aggregatedArray[0].servicers;
	}

	async patchVehicleTrackerInfo(
		vehicleId: string,
		IMEI: string,
		updateData: PatchTrackerPayload
	): Promise<Vehicle> {
		return await editTracker(vehicleId, IMEI, updateData);
	}

	async addVehicleTracker(vehicle: Vehicle): Promise<any> {
		switch (vehicle.type) {
			case VehicleType.SCOOTER:
				await addTracker(
					vehicle?.trackerInfo?.trackerPhone,
					vehicle?.trackerInfo?.trackerIMEI,
					vehicle?.model,
					0
				); // 0 means SCOOTER
				break;
			case VehicleType.BIKE:
				await addTracker(
					vehicle?.trackerInfo?.trackerPhone,
					vehicle?.trackerInfo?.trackerIMEI,
					vehicle?.model,
					0
				); // 0 means SCOOTER or BIKE
				break;
			case VehicleType.CAR:
				await addTracker(
					vehicle?.trackerInfo?.trackerPhone,
					vehicle?.trackerInfo?.trackerIMEI,
					vehicle?.model,
					1
				); // 1 means CAR
				break;
			default:
				// If nothing in type it's dummy but this shouldn't happen
				break;
		}
		return false;
	}

	async delVehicleTracker(IMEI: string): Promise<string> {
		return await delTracker(IMEI);
	}

	async powerVehicle(vehicle: Vehicle, direction: PowerDirection): Promise<Vehicle> {
		const tracker = vehicle.getTracker();
		if (vehicle.IMEI.startsWith('#')) {
			await tracker.unlock(direction);
		}
		const updateData: Vehicle = {} as any;
		updateData['liveInfo.lockStatus'] =
			direction === PowerDirection.OFF ? LockStatus.LOCKED : LockStatus.UNLOCKED;
		return await this.updateVehicle(vehicle.id, updateData);
	}

	async powerVehicleScooter(vehicle: Vehicle, direction: PowerCommand): Promise<Vehicle> {
		if (vehicle?.liveInfo?.bleLockExists) {
			vehicle = await this.unlockVehicleBluetoothLock(vehicle);
		}
		await scooterPC(vehicle?.trackerInfo?.trackerIMEI, direction);
		return vehicle;
	}

	async powerVehicleBike(vehicle: Vehicle, command: BikePowerCommand): Promise<Vehicle> {
		if (vehicle?.liveInfo?.bleLockExists) {
			// vehicle = await this.unlockVehicleBluetoothLock(vehicle);
		}
		await bikePC(vehicle?.trackerInfo?.trackerIMEI, command);
		await bikePC(vehicle?.trackerInfo?.trackerIMEI, command);
		return vehicle;
	}

	async powerVehicleCar(vehicle: Vehicle, direction: PowerDirection): Promise<Vehicle> {
		vehicle = await this.unlockVehicleDoor(vehicle, direction);
		return vehicle;
	}

	async unlockVehicleDoor(vehicle: Vehicle, direction: PowerDirection): Promise<Vehicle> {
		const updateData: Vehicle = {} as any;
		updateData['liveInfo.lockStatus'] =
			direction === PowerDirection.OFF ? LockStatus.LOCKED : LockStatus.UNLOCKED;
		const tracker = vehicle.getTracker();
		await tracker.unlock(direction);
		return await this.updateVehicle(vehicle.id, updateData);
	}

	async unlockVehicleBluetoothLock(vehicle: Vehicle): Promise<Vehicle> {
		const updateData: Vehicle = {} as any;
		updateData['liveInfo.lockStatus'] = LockStatus.UNLOCKED;
		await unlockBluetoothLock(vehicle.trackerInfo.trackerIMEI);
		return await this.updateVehicle(vehicle.id, updateData);
	}

	async vehicleLookfor(vehicleId: string): Promise<boolean> {
		const vehicle: Vehicle = await this.getVehicle(vehicleId);
		return await lookFor(vehicle.trackerInfo.trackerIMEI);
	}

	async vehicleIotBeep(vehicleId: string): Promise<boolean> {
		const vehicle: Vehicle = await this.getVehicle(vehicleId);
		return await setAlarm(vehicle.trackerInfo.trackerIMEI, 30);
	}

	async vehicleIoTReset(vehicleId: string): Promise<boolean> {
		const vehicle: Vehicle = await this.getVehicle(vehicleId);
		await clearVehicleCommandsQueue(vehicle?.trackerInfo?.trackerIMEI);
		await clearOldTrackerData(vehicle?.trackerInfo?.trackerIMEI);
		return await resetIoT(vehicle?.trackerInfo?.trackerIMEI);
	}

	async vehicleBTLockReset(vehicleId: string): Promise<boolean> {
		const vehicle: Vehicle = await this.getVehicle(vehicleId);
		await resetIoT(vehicle?.trackerInfo?.trackerIMEI);
		return await unlockBluetoothLock(vehicle?.trackerInfo.trackerIMEI);
	}

	async vehicleIgnitionControl(vehicleId: string, direction: PowerDirection): Promise<boolean> {
		const updateData: Vehicle = {} as any;
		updateData['liveInfo.imobilized'] = direction === PowerDirection.ON;
		const vehicle: Vehicle = await this.updateVehicle(vehicleId, updateData);
		const tracker: FMB120 = <FMB120>vehicle.getTracker();
		return await tracker.blockEngineRelay(direction);
	}

	async vehicleIgnitionCanControl(
		vehicleId: string,
		direction: PowerDirection
	): Promise<boolean> {
		const updateData: Vehicle = {} as any;
		updateData['liveInfo.imobilized'] = direction === PowerDirection.ON;
		const vehicle: Vehicle = await this.updateVehicle(vehicleId, updateData);
		const tracker: FMB120 = <FMB120>vehicle.getTracker();
		return await tracker.blockEngineCan(direction);
	}

	async addGeofence(vehicleId: string, fenceId: string): Promise<Vehicle> {
		// We operate with TinyFence everywhere if we dont need polygon
		const fence: GetGeofencePayload = await this.geofenceManager.getTinyFence(fenceId);
		const vehicle: Vehicle = await await this.getVehicle(vehicleId);
		if (fence.type === Type.COUNTRY) vehicle?.geofence?.allowedCountries.push(fenceId);
		if (fence.type === Type.CITY) vehicle?.geofence?.cityAreas.push(fenceId);
		return await this.updateVehicle(vehicleId, vehicle);
	}

	async removeGeofence(vehicleId: string, fenceId: string): Promise<Vehicle> {
		// We operate with TinyFence everywhere if we dont need polygon
		const fence: GetGeofencePayload = await this.geofenceManager.getTinyFence(fenceId);
		const vehicle: Vehicle = await this.getVehicle(vehicleId);
		if (fence.type === Type.COUNTRY) {
			const index = vehicle?.geofence?.allowedCountries.indexOf(fenceId);
			if (index > -1) vehicle?.geofence?.allowedCountries.splice(index, 1);
		}
		if (fence.type === Type.CITY) {
			const index = vehicle?.geofence?.cityAreas.indexOf(fenceId);
			if (index > -1) vehicle?.geofence?.cityAreas.splice(index, 1);
		}
		return await this.updateVehicle(vehicleId, vehicle);
	}

	async getLastRides(
		number: number,
		vehicleId: string,
		bookingManager: BookingManager,
		userManager: UserManager
	): Promise<Booking[]> {
		const pagination: SearchPagination = new SearchPagination({
			pageSize: number,
			sortField: 'createdAt',
			sortOrder: SortOrder.DESC
		});
		// TODO: Test this

		const lastRents: Booking[] = await bookingManager.getBookings(
			{ 'vehicle._id': vehicleId },
			pagination
		);

		for (const rent of lastRents) {
			Object.assign(rent, {
				renter: deserialize(UserBasicPayload, await userManager.getUser(rent.userId))
			});
		}
		return lastRents;
	}

	async getPath(trackerImei: string, start: number, end: number): Promise<PathPoint[]> {
		const data = (await retrievePathApi(trackerImei, start, end, 60)) || [];
		return data?.data || [];
	}

	async countValidTourVehicles(
		userId: string,
		tour: Tour,
		scannedVehicle: Vehicle = null
	): Promise<number> {
		return await this.countVehicles(getVehicleTourReadyFilter(tour, scannedVehicle, userId));
	}

	async getValidTourVehicles(
		userId: string,
		tour: Tour,
		scannedVehicle: Vehicle = null
	): Promise<Vehicle[]> {
		return await this.getVehicles(getVehicleTourReadyFilter(tour, scannedVehicle, userId));
	}

	async reserveTourVehicles(
		tour: Tour,
		vehicleCount: number,
		user: User,
		scannedVehicle: Vehicle = null
	): Promise<Vehicle[]> {
		const validTourVehicles: Vehicle[] = await this.getValidTourVehicles(
			user.id,
			tour,
			scannedVehicle
		);
		if (validTourVehicles.length < vehicleCount)
			throw new CustomError(444, 'Not enough vehicles in the area!');

		const foundScannedVehicle: Vehicle = _.remove(
			validTourVehicles,
			el => el.id === scannedVehicle.id
		)[0]; // remove scanned vehicle from list
		validTourVehicles.unshift(foundScannedVehicle); // unshift scanned if found at begining of array

		await this.reserveVehiclesForTour(
			validTourVehicles.slice(0, vehicleCount).map(vehicle => vehicle.id),
			user
		);

		return validTourVehicles.slice(0, vehicleCount);
	}

	async reserveVehiclesForTour(vehicleIds: string[], user: User): Promise<boolean> {
		const reservationData: Partial<Vehicle> = {
			available: VehicleAvailable.TOUR_RESERVED,
			reservation: { reservedBy: user.id, reservedAt: Date.now() }
		};

		return await this.updateVehicles({ _id: { $in: vehicleIds } }, reservationData);
	}

	async getTourVehiclesReserved(user: User): Promise<Vehicle[]> {
		const filter = {
			status: VehicleStatus.VERIFIED,
			available: VehicleAvailable.TOUR_RESERVED,
			'reservation.reservedBy': user.id
		};

		return await this.getVehicles(filter);
	}

	async getVehicleOperationStats(): Promise<OperStats[]> {
		const operationsAggregation: any = [
			{
				$lookup: {
					from: 'mb-rents',
					localField: '_id',
					foreignField: 'vehicle._id',
					as: 'vehicleRents'
				}
			},
			{
				$project: {
					lastHourRents: {
						$size: {
							$filter: {
								input: '$vehicleRents',
								as: 'rent',
								cond: {
									$gte: [
										'$$rent.createdAt',
										moment().subtract(1, 'h').startOf('hour')
									]
								}
							}
						}
					},
					vehicleId: '$_id',
					ownerId: '$userId',
					managerIds: '$maintainedBy.managers',
					servicerIds: '$maintainedBy.servicers',
					battery: '$liveInfo.batteryPercentage',
					status: {
						$cond: {
							if: {
								$and: [
									{ $eq: ['$status', 'VERIFIED'] },
									{ $eq: ['$available', 'ONLINE'] }
								]
							},
							then: 'READY',
							else: {
								$cond: {
									if: {
										$and: [
											{ $eq: ['$status', 'HIDDEN'] },
											{ $eq: ['$available', 'ONLINE'] }
										]
									},
									then: 'HIDDEN',
									else: {
										$cond: {
											if: {
												$and: [
													{ $eq: ['$status', 'HIDDEN'] },
													{ $eq: ['$available', 'OFFLINE'] }
												]
											},
											then: 'STORAGE',
											else: {
												$cond: {
													if: {
														$and: [
															{ $eq: ['$status', 'HIDDEN'] },
															{ $eq: ['$available', 'OFFLINE'] },
															{ $eq: ['$liveInfo.charging', true] }
														]
													},
													then: 'CHARGING',
													else: {
														$cond: {
															if: {
																$eq: ['$status', 'STOLEN']
															},
															then: 'STOLEN',
															else: 'OTHER'
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		];
		return await this.vehicleRepository.aggregate(operationsAggregation);
	}

	async getAggregatedForExport(startInterval: number, endInterval: number): Promise<any> {
		const aggregationFilter: any = [
			{
				$match: {
					$and: [
						{ createdAt: { $gte: startInterval } },
						{ createdAt: { $lte: endInterval } }
					]
				}
			},
			{
				$project: {
					id: '$_id',
					type: { $ifNull: ['$type', null] },
					IMEI: { $ifNull: ['$IMEI', null] },
					'pricing.type': { $ifNull: ['$pricing.type', null] },
					serialNumber: { $ifNull: ['$serialNumber', null] },
					'trackerInfo.trackerIMEI': { $ifNull: ['$trackerInfo.trackerIMEI', null] },
					'trackerInfo.trackerPhone': { $ifNull: ['$trackerInfo.trackerPhone', null] },
					'trackerInfo.btlockIMEI': { $ifNull: ['$trackerInfo.btlockIMEI', null] },
					'liveInfo.totalMileage': { $ifNull: ['$trackerInfo.totalMileage', null] },
					'liveInfo.lat': { $ifNull: ['$liveInfo.lat', null] },
					'liveInfo.lon': { $ifNull: ['$liveInfo.lon', null] },
					'liveInfo.geoName': { $ifNull: ['$liveInfo.geoName', null] },
					'liveInfo.lockCode': { $ifNull: ['$liveInfo.lockCode', null] },
					userId: { $ifNull: ['$userId', null] },
					'maintainedBy.managers': { $ifNull: ['$maintainedBy.managers', []] },
					'maintainedBy.servicers': { $ifNull: ['$maintainedBy.servicers', []] },
					'returnOptions.returnReq': { $ifNull: ['$returnOptions.returnReq', null] },
					'STG.enabled': { $ifNull: ['$STG.enabled', null] },
					requiredPhoto: { $ifNull: ['$requiredPhoto', null] },
					requiredExtraPhoto: { $ifNull: ['$requiredExtraPhoto', null] },
					modifiedAt: { $ifNull: ['$modifiedAt', null] },
					createdAt: { $ifNull: ['$createdAt', null] }
				}
			}
		];
		return await this.vehicleRepository.aggregate(aggregationFilter);
	}*/
}
