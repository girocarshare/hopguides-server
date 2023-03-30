
export class Point {

	id: string;

	icon: string;

	text: string;

}


export class Location {
	lat: string;

	lng: string;


}


export class Characteristics {

	name: string;

	value: string;

	icon: string;


}

export class Logo {
	image: string;
  
	height: string;

	width: string;
  }
export class TourData {

	tourId: string;

	image: string;

	title: string;

	shortInfo: string;

	longInfo: string;

	audio: string;

	points: Point[];

	characteristics: Characteristics[];

	termsAndConditionsLink: string;

	agreementTitle: string;

	agreementDesc: string;

	logo: Logo;

	bookingId: string;

}
