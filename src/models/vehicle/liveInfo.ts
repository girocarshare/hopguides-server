import { LockStatus } from './enums';
import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { integer, max, min, required } from '../../validations/decorators';
import { GeoLocation } from '../address/geoLocation';

export class VehicleLiveInfo {
	@jsonProperty()
	@dbField()
	@required()
	lon: number = 46.050492;

	@jsonProperty()
	@dbField()
	@required()
	lat: number = 14.46881;

	@jsonProperty()
	@dbField()
	loc: GeoLocation;

	@jsonProperty()
	@dbField()
	alt: number = 300;

	@jsonProperty()
	@dbField()
	country: string = 'Unknown';

	@jsonProperty()
	@dbField()
	speed: number = null;

	@jsonProperty()
	@dbField()
	@required()
	@min(0)
	@max(100)
	@integer()
	batteryPercentage: number = 42;

	@jsonProperty()
	@dbField()
	remainingMileage: number = 42;

	@jsonProperty()
	@dbField()
	fuelLevel: number = -1;

	@jsonProperty()
	@dbField()
	operatingMode: number = null;

	@jsonProperty()
	@dbField()
	totalMileage: number = -1;

	@jsonProperty()
	@dbField()
	@required()
	lockStatus: LockStatus = LockStatus.LOCKED;

	@jsonProperty()
	@dbField()
	lockCode: string = null;

	@jsonProperty()
	@dbField()
	bleLockStatus: number = 0;

	@jsonProperty()
	@dbField()
	bleLockBattery: number = 0;

	@jsonProperty()
	@dbField()
	bleLockExists: boolean = false;

	@jsonProperty()
	@dbField()
	isIgnited: number = 0;

	@jsonProperty()
	@dbField()
	isMoving: number = 0;

	@jsonProperty()
	@dbField()
	driveMode: number = 0;

	@jsonProperty()
	@dbField()
	locationLink: string = null;

	@jsonProperty()
	@dbField()
	doorStatus: number = 0;

	@jsonProperty()
	@dbField()
	speedLimit: number = 0;

	@jsonProperty({ type: String })
	@dbField({ type: String })
	securityStateFlags: string[];

	@jsonProperty()
	@dbField()
	geoId: number = -1;

	@jsonProperty()
	@dbField()
	geoDistance: number = -1;

	@jsonProperty()
	@dbField()
	geoName: string = 'Unknown';

	@jsonProperty()
	@dbField()
	imobilized: boolean = false;

	@jsonProperty()
	@dbField()
	isCharging: boolean = false;

	@jsonProperty()
	@dbField()
	modifiedAt: number = Date.now();
}
