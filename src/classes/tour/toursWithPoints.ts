import { jsonProperty } from '../../json/decorations';
import { email, notEmpty, required } from '../../validations/decorators';
import { POI } from '../../models/tours/poi';
import { LocalizedField } from '../../models/localizedField';
export class PointsForTours {

	point: POI;

	monthlyUsed : number;

}
export class ToursWithPoints {

	tourId: string;
	
	currency: string;

	points: PointsForTours[];

	title: LocalizedField;
	
	longInfo: LocalizedField;
	
	shortInfo: LocalizedField;

	images: string[];

	price: number;
	
	image: string;
	
	audio: string;
	
	duration: string;

	length: string;

	highestPoint: string;

	termsAndConditions: string;
	
}
