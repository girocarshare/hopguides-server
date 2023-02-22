import { jsonProperty } from '../../json/decorations';
import { email, notEmpty, required } from '../../validations/decorators';

export class ToursReport {

	tourId: string;

	tourName: string;
	
	tourPrice: number;
	
	noOfRidesAMonth: number;
}
