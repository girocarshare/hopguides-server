import { jsonProperty } from '../../json/decorations';
import { email, notEmpty, required } from '../../validations/decorators';

export class PreviousTourReport {
	from: string;
	count: number;
}
