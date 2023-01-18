import { jsonProperty } from '../../json/decorations';
import { email, notEmpty, required } from '../../validations/decorators';
import { POI } from '../../models/tours/poi';
export class PointsForTours {

	point: POI;

	monthlyUsed : number;

}
export class ToursWithPoints {

	tourId: string;

	tourName: string;

	points: PointsForTours[];
	
}
