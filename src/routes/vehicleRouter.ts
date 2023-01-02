import { Booking } from '../models/booking/booking';
//import * as multer from 'multer';
import { IRequest, IResponse } from '../classes/interfaces';
import { deserialize, serialize } from '../json';
//import { BookingManager } from '../manager/bookingManager';
import { VehicleManager } from '../manager/vehicleManager';
//import { TransactionManager } from '../manager/transactionManager';
import { UserManager } from '../manager/userManager';
import { Vehicle } from '../models/vehicle/vehicle';
//import { PowerDirection, VehicleAvailable, VehicleStatus } from '../models/car/enums';
import {
	/*AdminRole,
	allowFor,
	deleteUndefinedFields,
	ManagerRole,
	maskUserData,
	parseJwt,
	ServiceRole,
	SupportRole,
	UserRole,*/
	withErrorHandler
} from '../utils/utils';
import { BaseRouter } from './baseRouter';
/*import { SearchPagination } from '../classes/searchPagination';
import { SearchCarQueryPayload } from '../classes/vehicle/searchCarQueryPayload';
import { NotificationManager } from '../manager/notificationManager';
import { PatchTrackerPayload } from '../classes/vehicle/trackerPatchPayload';
import { validateOrThrow } from '../validations';
import { User, UserRoles } from '../models/user/user';
import { CustomError } from '../classes/customError';
import { BlastManager } from '../manager/blastManager';
import { UserBasicPayload } from '../classes/user/userBasicPayload';
import { IoTEventManager } from '../manager/iotEventManager';
import { TrackerEvent } from '../models/tracker/TrackerEvent';
import { SearchIoTEventFilter } from '../classes/searchIoTEventFilter';*/
import { Logger } from 'tslog';

export class VehicleRouter extends BaseRouter {
	vehicleManager: VehicleManager;
	/*bookingManager: BookingManager;
	transactionManager: TransactionManager;
	userManager: UserManager;
	blastManager: BlastManager;
	notificationManager: NotificationManager;
	iotEventManager: IoTEventManager;*/
	logger: Logger = new Logger();

	upload: any;

	constructor() {
		super(true);
		// todo : why this folder is explicit ??
		//this.upload = multer({ dest: '/tmp/uploads/' });
		this.vehicleManager = new VehicleManager();
		/*this.bookingManager = new BookingManager();
		this.transactionManager = new TransactionManager();
		this.userManager = new UserManager();
		this.notificationManager = new NotificationManager();
		this.blastManager = new BlastManager();
		this.iotEventManager = new IoTEventManager();*/
		this.init();
	}

	init(): void {


			/** POST create vehicle  */ 
		this.router.post(
			'/',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					const createdVehicle: Vehicle = await this.vehicleManager.createVehicle(
						 deserialize(Vehicle, req.body)
					);
					
					return res.status(200).send(createdVehicle);
				} catch (err) {
					console.log(err.error)
				}
			})
		);

	
		/** GET the list of cars   
		this.router.get(
			'/',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const pagination: SearchPagination = new SearchPagination(req.query);
				const user: User = await this.userManager.getUser(req.userId);
				const filter: SearchCarQueryPayload = SearchCarQueryPayload.build(req.query, user);
				deleteUndefinedFields(filter);
				const vehicles: Vehicle[] = await this.carManager.getVehiclesQuery(
					filter,
					pagination
				);
				return res.respond(
					200,
					vehicles.map(c => serialize(c))
				);
			})
		);
			

		/**
		 * GET number of all vehicles
		   
		this.router.get(
			'/count',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const count: number = await this.carManager.countVehicles();
				return res.respond(200, count);
			})
		);

		/** GET fetches IoT events with filters   
		this.router.get(
			'/iotEvents',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const filter: SearchIoTEventFilter = SearchIoTEventFilter.build(req.query);
				const events: TrackerEvent[] = await this.iotEventManager.getIoTEventsWithFilter(
					filter
				);
				return res.respond(200, events);
			})
		);

		/** GET fetches IoT events with filters   
		this.router.get(
			'/:vehicleId/iotEvents',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const filter: SearchIoTEventFilter = SearchIoTEventFilter.build({
					vehicleId: req.params.vehicleId,
					...req.query
				});
				const events: TrackerEvent[] = await this.iotEventManager.getIoTEventsWithFilter(
					filter
				);
				return res.respond(200, events);
			})
		);

		/**
		 * POST Updates cars available status. If direction == true available status = service. Otherwise status = available
		   
		this.router.post(
			'/:vehicleId/service',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const vehicle: Vehicle = await this.carManager.getVehicle(req.params.vehicleId);
				const direction: boolean = req.body.direction;
				const updateData: any = direction
					? { status: VehicleStatus.SERVICE, available: VehicleAvailable.OFFLINE }
					: { status: VehicleStatus.VERIFIED, available: VehicleAvailable.ONLINE };
				updateData.modifiedAt = Date.now();
				updateData['changeLog.changedBy'] = req.userId;
				updateData['changeLog.changedAt'] = Date.now();

				const servicedVehicle: Vehicle = await this.carManager.updateVehicle(
					vehicle.id,
					updateData
				);
				return res.respond(200, servicedVehicle);
			})
		);

		/**
		 * PUT Updates tracker info in the database and tcp server
		   
		this.router.put(
			'/:vehicleId/editTrackerInfo',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const vehicle: Vehicle = await this.carManager.getVehicle(req.params.vehicleId);
				const updateData: PatchTrackerPayload = deserialize(PatchTrackerPayload, req.body);
				deleteUndefinedFields(updateData);
				validateOrThrow(updateData);
				const patchedVehicle: Vehicle = await this.carManager.patchVehicleTrackerInfo(
					vehicle.id,
					vehicle.trackerInfo.trackerIMEI,
					updateData
				);

				return res.respond(200, patchedVehicle);
			})
		);

		/**
		 * DELETE Delete tracker from tcp server
		   
		this.router.delete(
			'/:vehicleId/delTracker',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				await this.carManager.getVehicle(req.params.vehicleId);
				const imei: string = req.body.imei;
				const result = await this.carManager.delVehicleTracker(imei);
				// TODO: tole nikjer ne dela UPDATE v bazi?!?
				return res.respond(200, result);
			})
		);

		/** GET fetches car data with user details   
		this.router.get(
			'/:vehicleId',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const vehicle: Vehicle = await this.carManager.getVehicle(req.params.vehicleId);

				/** START OF SECURITY CHECKS   

				/** Check if booking, owner & customer exist   
				// todo : users shall use only `VERIFIED` vehicles...
				if (vehicle.status === VehicleStatus.DELETED)
					throw new CustomError(404, 'Invalid vehicle');

				/** END OF SECURITY CHECKS   

				// todo : this enables any user to track al the vehicles, even the one
				//        being currently in user by other users, this is a bad security
				//        and privacy breach.

				// todo : this serialize is not configured properly,
				//        all dara are exposed
				const allowedUsers: User[] = await this.userManager.getUsers({
					phone: { $in: vehicle?.private?.phoneList }
				});
				Object.assign(vehicle?.private, {
					allowedUsers: allowedUsers.map(u => deserialize(UserBasicPayload, u))
				});
				return res.respond(200, serialize(vehicle));
			})
		);

		/**
		 * POST Unlocks the vehicle BT lock
		   
		this.router.post(
			'/:vehicleId/manBTLRelease',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, UserRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				// todo : so any user simply by being authenticated can unlock any vehicle it wants?
				//		  i'm not sure this can be something acceptable

				// todo : all reservation logic
				//        I'm not sure about this logic at all, unless it is allowed for users
				//        to lock / unlock the scooter while riding. In that case we shall still
				//        check for active USER->BOOKING->VEHICLE link
				const vehicle: Vehicle = await this.carManager.getVehicle(req.params.vehicleId);
				if (req.role === UserRoles.USER && vehicle.available !== VehicleAvailable.DRIVING) {
					throw new CustomError(403, 'Unauthorized manual unlock');
				}

				this.logger.info('BTLock release: ' + req.userId);

				return res.respond(
					200,
					!!(await this.carManager.unlockVehicleBluetoothLock(vehicle))
				);
			})
		);

		/**
		 * POST Resets IoT device
		   
		this.router.post(
			'/:vehicleId/manBTLReset',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const result: boolean = await this.carManager.vehicleBTLockReset(
					req.params.vehicleId
				);
				this.logger.info('IoT reset: ' + req.userId);

				return res.respond(200, result);
			})
		);

		/**
		 * POST Resets IoT device
		   
		this.router.post(
			'/:vehicleId/manIoTReset',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const result: boolean = await this.carManager.vehicleIoTReset(req.params.vehicleId);
				this.logger.info('IoT reset by: ' + req.userId);

				return res.respond(200, result);
			})
		);

		/**
		 * Enables mode for transport for SERVICE & MANAGERS
		   
		this.router.post(
			'/:vehicleId/manTransON',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				let servicedVehicle: Vehicle = await this.carManager.getVehicle(
					req.params.vehicleId
				);

				const result = !!(await this.carManager.powerVehicle(
					servicedVehicle,
					PowerDirection.ON
				));

				if (result) {
					const updateData: Vehicle = {} as any;
					updateData.available = VehicleAvailable.OFFLINE;
					updateData.alertsEnabled = false;
					updateData.modifiedAt = Date.now();
					updateData['changeLog.changedBy'] = req.userId;
					updateData['changeLog.changedAt'] = Date.now();
					servicedVehicle = await this.carManager.updateVehicle(
						req.params.vehicleId,
						updateData
					);
				}

				return res.respond(200, !!servicedVehicle);
			})
		);

		/**
		 * Disables mode for transport for SERVICE & MANAGERS
		   
		this.router.post(
			'/:vehicleId/manTransOFF',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				let servicedVehicle: Vehicle = await this.carManager.getVehicle(
					req.params.vehicleId
				);

				const result = !!(await this.carManager.powerVehicle(
					servicedVehicle,
					PowerDirection.OFF
				));

				const updateData: Vehicle = {} as any;
				if (result) {
					updateData.available = VehicleAvailable.ONLINE;
					// updateData.alertsEnabled = true;
					updateData.modifiedAt = Date.now();
					updateData['changeLog.changedBy'] = req.userId;
					updateData['changeLog.changedAt'] = Date.now();
					updateData['changeLog.deployLocation'] =
						servicedVehicle?.liveInfo?.loc?.locLink;
					servicedVehicle = await this.carManager.updateVehicle(
						req.params.vehicleId,
						updateData
					);
				}

				return res.respond(200, !!servicedVehicle);
			})
		);

		/** GET scooter Look For Light   
		this.router.post(
			'/:vehicleId/car/unlockDoor',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const vehicle: Vehicle = await this.carManager.getVehicle(req.params.vehicleId);

				const response: any = await this.carManager.powerVehicleCar(
					vehicle,
					PowerDirection.ON
				);
				return res.respond(200, response);
			})
		);

		/** GET scooter Look For Light   
		this.router.post(
			'/:vehicleId/car/lockDoor',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const vehicle: Vehicle = await this.carManager.getVehicle(req.params.vehicleId);

				const response: any = await this.carManager.powerVehicleCar(
					vehicle,
					PowerDirection.OFF
				);
				return res.respond(200, response);
			})
		);

		/** GET scooter Look For Light   
		this.router.get(
			'/:vehicleId/lookFor/light',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const response: any = await this.carManager.vehicleLookfor(req.params.vehicleId);
				return res.respond(200, response);
			})
		);

		/** GET scooter Look For Beep   
		this.router.get(
			'/:vehicleId/lookFor/beep',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const response: any = await this.carManager.vehicleIotBeep(req.params.vehicleId);
				return res.respond(200, response);
			})
		);

		/** POST Enable imobilizer   
		this.router.post(
			'/:vehicleId/car/imobilizeOn',
			allowFor([AdminRole, ManagerRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const response: any =
					(await this.carManager.vehicleIgnitionControl(
						req.params.vehicleId,
						PowerDirection.OFF
					)) &&
					(await this.carManager.vehicleIgnitionCanControl(
						req.params.vehicleId,
						PowerDirection.OFF
					));
				return res.respond(200, response);
			})
		);

		/** POST disable imobilizer   
		this.router.post(
			'/:vehicleId/car/imobilizeOff',
			allowFor([AdminRole, ManagerRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const response: any =
					(await this.carManager.vehicleIgnitionControl(
						req.params.vehicleId,
						PowerDirection.ON
					)) &&
					(await this.carManager.vehicleIgnitionCanControl(
						req.params.vehicleId,
						PowerDirection.ON
					));
				return res.respond(200, response);
			})
		);

		/** POST add geofence to vehicle   
		this.router.post(
			'/:vehicleId/geof/:geofId',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const vehicle: Vehicle = await this.carManager.addGeofence(
					req.params.vehicleId,
					req.params.geofId
				);
				return res.respond(200, vehicle);
			})
		);

		/** DELETE remove geofence from vehicle   
		this.router.delete(
			'/:vehicleId/geof/:geofId',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const vehicle: Vehicle = await this.carManager.removeGeofence(
					req.params.vehicleId,
					req.params.geofId
				);
				return res.respond(200, vehicle);
			})
		);

		/** GET fetches last 10 rides of the vehicle   
		this.router.get(
			'/:vehicleId/lastRents',
			allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const lastRents: Booking[] = await this.carManager.getLastRides(
					req.body.occurs || 3,
					req.params.vehicleId,
					this.bookingManager,
					this.userManager
				);
				return res.respond(200, maskUserData(lastRents, req?.user?.roleMB));
			})
		);
		*/}
}
