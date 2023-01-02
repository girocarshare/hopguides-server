import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { required } from '../../validations/decorators';
import { VehicleType, VehicleVersion } from '../../models/vehicle/enums';
import { Tracker } from '../../models/vehicle/tracker';

export class CreateVehiclePayload {
	@jsonProperty()
	@dbField()
	@required()
	serialNumber: string;

	@jsonProperty()
	@dbField()
	@required()
	type: VehicleType;

	@jsonProperty()
	@dbField()
	model: string;

	@jsonProperty()
	@dbField()
	@required()
	trackerInfo: Tracker;

	@jsonProperty()
	@dbField()
	@required()
	version: VehicleVersion;
}
