import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { integer, max, min, required } from '../../validations/decorators';
import { GeoLocation } from '../address/geoLocation';
import { LockStatus } from './enums';

export class VehicleLiveInfo {
	@jsonProperty()
	@dbField()
	@required()
	lon = 46.050492;

	@jsonProperty()
	@dbField()
	@required()
	lat = 14.46881;

	@jsonProperty()
	@dbField()
	loc: GeoLocation;

	@jsonProperty()
	@dbField()
	alt = 300;

	@jsonProperty()
	@dbField()
	country = 'Unknown';

	@jsonProperty()
	@dbField()
	speed: number = null;

	@jsonProperty()
	@dbField()
	@required()
	@min(0)
	@max(100)
	@integer()
	batteryPercentage = 42;

	@jsonProperty()
	@dbField()
	remainingMileage = 42;

	@jsonProperty()
	@dbField()
	fuelLevel = -1;

	@jsonProperty()
	@dbField()
	operatingMode: number = null;

	@jsonProperty()
	@dbField()
	totalMileage = -1;

	@jsonProperty()
	@dbField()
	@required()
	lockStatus: LockStatus = LockStatus.LOCKED;

	@jsonProperty()
	@dbField()
	lockCode: string = null;

	@jsonProperty()
	@dbField()
	bleLockStatus = 0;

	@jsonProperty()
	@dbField()
	bleLockBattery = 0;

	@jsonProperty()
	@dbField()
	bleLockExists = false;

	@jsonProperty()
	@dbField()
	isIgnited = 0;

	@jsonProperty()
	@dbField()
	isMoving = 0;

	@jsonProperty()
	@dbField()
	driveMode = 0;

	@jsonProperty()
	@dbField()
	locationLink: string = null;

	@jsonProperty()
	@dbField()
	doorStatus = 0;

	@jsonProperty()
	@dbField()
	speedLimit = 0;

	@jsonProperty({ type: String })
	@dbField({ type: String })
	securityStateFlags: string[];

	@jsonProperty()
	@dbField()
	geoId = -1;

	@jsonProperty()
	@dbField()
	geoDistance = -1;

	@jsonProperty()
	@dbField()
	geoName = 'Unknown';

	@jsonProperty()
	@dbField()
	imobilized = false;

	@jsonProperty()
	@dbField()
	isCharging = false;

	@jsonProperty()
	@dbField()
	modifiedAt: number = Date.now();
}
