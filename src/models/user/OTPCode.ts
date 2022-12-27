import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class OTPCode {
	@jsonProperty()
	@dbField()
	verificationCode: string = null;

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	createdAt: number = null;
}
