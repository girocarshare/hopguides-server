// import { dbField } from '../../db/decorators';
// import { jsonProperty } from '../../json/decorations';
// import { max, min, validEnum } from '../../validations/decorators';
// import { GeoLocation } from '../address/geoLocation';
// import { Geofence } from '../car/carGeofence';
// import { Maintenance } from '../car/carMaintenance';
// import { VehiclePricing } from '../car/carPricing';
// import { Private } from '../car/carPrivate';
// import { VehicleTracker } from '../car/carTracker';
// import {
// 	LockStatus,
// 	VehicleAvailable,
// 	VehicleStatus,
// 	VehicleType,
// 	VehicleVersion
// } from '../car/enums';
// import { OperatingMode } from '../tracker/trackerTST100';
// import { PathPoint } from './PathPoint';

// export class StateInfo {
// 	@jsonProperty()
// 	@dbField()
// 	time: number;

// 	@jsonProperty()
// 	@dbField()
// 	lockStatus: LockStatus;

// 	@jsonProperty()
// 	@dbField()
// 	location: GeoLocation;

// 	@jsonProperty()
// 	@dbField()
// 	device: GeoLocation;

// 	@jsonProperty()
// 	@dbField()
// 	@min(-1)
// 	@max(100)
// 	battery: number = -1;

// 	@jsonProperty()
// 	@dbField()
// 	@min(-1)
// 	@max(100)
// 	fuel: number = -1;

// 	@jsonProperty()
// 	@dbField()
// 	mileage: number;

// 	@jsonProperty()
// 	@dbField()
// 	speedLimit: number;

// 	@jsonProperty()
// 	@dbField()
// 	operatingMode: OperatingMode;

// 	@jsonProperty()
// 	@dbField()
// 	doorStatus: number;

// 	@jsonProperty()
// 	@dbField()
// 	imobilized: boolean;

// 	@jsonProperty()
// 	@dbField()
// 	image: string;

// 	@jsonProperty()
// 	@dbField()
// 	geoName: string;

// 	@jsonProperty()
// 	@dbField()
// 	country: string;

// 	@jsonProperty()
// 	@dbField()
// 	signalTime: number;
// }

// export class VehicleRentState {
// 	@jsonProperty()
// 	@dbField()
// 	start: StateInfo;

// 	@jsonProperty()
// 	@dbField()
// 	end: StateInfo;
// }

// export class BookingVehicle {
// 	@jsonProperty()
// 	@dbField()
// 	id: string;

// 	@jsonProperty()
// 	@dbField()
// 	IMEI: string;

// 	@jsonProperty()
// 	@dbField()
// 	userId: string;

// 	@jsonProperty()
// 	@dbField()
// 	type: VehicleType;

// 	@jsonProperty()
// 	@dbField()
// 	status: VehicleStatus;

// 	@jsonProperty()
// 	@dbField()
// 	available: VehicleAvailable;

// 	@jsonProperty()
// 	@dbField()
// 	pricing: VehiclePricing;

// 	@jsonProperty()
// 	@dbField()
// 	maintainedBy: Maintenance;

// 	@jsonProperty()
// 	@dbField()
// 	private: Private;

// 	@jsonProperty()
// 	@dbField()
// 	geofence: Geofence;

// 	@jsonProperty()
// 	@dbField()
// 	modifiedAt: number;

// 	@jsonProperty({ type: PathPoint })
// 	@dbField({ type: PathPoint })
// 	@validEnum(PathPoint)
// 	path: PathPoint[];

// 	@jsonProperty()
// 	@dbField()
// 	lockCode: string;

// 	@jsonProperty()
// 	@dbField()
// 	title: string;

// 	@jsonProperty()
// 	@dbField()
// 	version: VehicleVersion;

// 	@jsonProperty()
// 	@dbField()
// 	serialNumber: string;

// 	@jsonProperty()
// 	@dbField()
// 	trackerInfo: VehicleTracker;

// 	@jsonProperty()
// 	@dbField()
// 	state: VehicleRentState;
// }
