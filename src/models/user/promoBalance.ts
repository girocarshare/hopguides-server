import { double } from 'aws-sdk/clients/lightsail';
import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class PromoBalance {
	@jsonProperty()
	@dbField()
	csBalance: double = 0.0;

	@jsonProperty()
	@dbField()
	mbBalance: double = 0.0;
}
