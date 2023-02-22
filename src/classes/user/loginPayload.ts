import { jsonProperty } from '../../json/decorations';
import { email, notEmpty, required } from '../../validations/decorators';

export class LoginPayload {
	@jsonProperty()
	@required()
	@email()
	email: string;

	@jsonProperty()
	@notEmpty()
	password: string;
}
