import { Maintenance } from './maintenance';
import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid, generateVehicleIMEI } from '../../utils/utils';
import { required, validEnum } from '../../validations/decorators';
import { VehicleLiveInfo } from './liveInfo';
import { VehicleAvailable, VehicleStatus, VehicleType, VehicleVersion } from './enums';
import { Tracker } from './tracker';
import { ChangeLog } from '../classes';

export class Vehicle {
	@id()
	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	@required()
	IMEI: string = generateVehicleIMEI(); /** Vehicle QR Code */

	@jsonProperty()
	@dbField()
	@required()
	type: VehicleType; /** Vehicle type CAR,SCOOTER,BIKE,OTHER */

	@jsonProperty()
	@dbField()
	@validEnum(VehicleVersion)
	version: VehicleVersion = VehicleVersion.NONE; /** This is a version of IoT */

	@jsonProperty()
	@dbField()
	@validEnum(VehicleStatus)
	status: VehicleStatus = VehicleStatus.HIDDEN; /** Vehicle status in app */

	@jsonProperty()
	@dbField()
	@required()
	serialNumber: string; /** Vehicle Serial Number */

	@jsonProperty()
	@dbField()
	@required()
	trackerInfo: Tracker; /** Vehicle IoT info */

	@jsonProperty()
	@dbField()
	@required()
	liveInfo: VehicleLiveInfo = new VehicleLiveInfo(); /** Vehicle real-time info from IoT */

	@jsonProperty()
	@dbField()
	@validEnum(VehicleAvailable)
	available: VehicleAvailable = VehicleAvailable.OFFLINE; /** Vehicle availability */

	@jsonProperty()
	@dbField()
	maintainedBy: Maintenance = new Maintenance(); /** Managers & servicers responsible */

	@jsonProperty()
	@dbField()
	model: string = ''; /** This is a text that shows on modal */

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	createdAt: number = Date.now(); /** Epoch creation time */

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	modifiedAt: number; /** Epoch change time */

	@dbField()
	@jsonProperty()
	changeLog: ChangeLog = new ChangeLog(); /** Log of last change by person & time of it */

	@jsonProperty()
	@dbField()
	tourId: string; 

}
