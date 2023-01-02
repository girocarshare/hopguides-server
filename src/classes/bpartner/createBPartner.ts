import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { BPartnerStatus } from '../../models/bpartner/bpartner';
import { double } from 'aws-sdk/clients/lightsail';

export class CreateBPartnerPayload {
	@jsonProperty()
	@dbField()
	userId: string;

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	status: BPartnerStatus = BPartnerStatus.INACTIVE;

	@jsonProperty()
	@dbField()
	discountPercent: double = 0.0;
}
