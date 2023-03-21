import { jsonProperty } from '../../json/decorations';
import { email, notEmpty, required } from '../../validations/decorators';
import { LocalizedField } from '../../models/localizedField';
import { POI } from '../../models/tours/poiModel';
export class PointsForTours {
  point: POI;

  monthlyUsed: number;

  voucher: string;

  hasVoucher: Boolean;
  
  voucherDesc: LocalizedField;
}

export class Logo {
	image: string;
  
	height: string;

	width: string;
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

	logo: Logo;

	termsAndConditions: string;

	agreementTitle: LocalizedField;

	
	agreementDesc: LocalizedField;
	
	partnerName: string;

	support: LocalizedField;
	
}
