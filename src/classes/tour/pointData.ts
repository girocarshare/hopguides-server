import { Image } from "../../models/tours/poiModel";

class Location {
	lat: string;

	lng: string;


}

class ImageTitle {
	number: string;

	name: string;


}
export class PointData {
	id: string;

	name: string;

	location: Location;

	shortInfo: string;

	longInfo: string;

	images: Image[];

	offerName: string;

	category: string;

	audio: string;

	voucher: string;

	hasVoucher: Boolean;

	voucherDesc: string;
	
	imageTitles: ImageTitle[];

	icon: string;
}

