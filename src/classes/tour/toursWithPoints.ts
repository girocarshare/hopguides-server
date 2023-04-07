import { jsonProperty } from '../../json/decorations';
import { email, notEmpty, required } from '../../validations/decorators';
import { LocalizedField } from '../../models/localizedField';
import { POI } from '../../models/tours/poiModel';
import { GeoLocation } from '../../models/address/geoLocation';

class Contact {
	phone: string;
	
	name: string;

	email: string;

	webURL: string;

}

class FromTo {
	from: string;

	to: string;

}

class WorkingHours {
	monday: FromTo;

	tuesday: FromTo;

	wednesday: FromTo;
	
	thursday: FromTo;
	
	friday: FromTo;
	
	saturday: FromTo;
	
	sunday: FromTo;

}

export class POICl {

	id: string ;

	idField: number;
	
	name: LocalizedField;

	location: GeoLocation;

	title: string;

	shortInfo: LocalizedField;

	longInfo: LocalizedField;

	contact: Contact;


	workingHours: WorkingHours;

	images: string[];

	icon: string;

	files: string[];
	
	menu: string
	

	offerName: string;
	
	price: number;

	partner: boolean;

	
	bpartnerId: string;

	category: string;

	
	audio: string;
  

  }

export class PointsForTours {
  point: POICl;
  pointCl: POI;
  monthlyUsed: number;

  voucher: string;

  hasVoucher: Boolean;
  
  voucherDesc: string;
}

export class Logo {
	image: string;
  
	height: string;

	width: string;
  }
export class ToursWithPoints {
	
	noOfRidesAMonth: number;

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

	support: string;
	bpartnerId: string;
	
}
