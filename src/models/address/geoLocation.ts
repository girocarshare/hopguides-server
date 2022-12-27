import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { max, min, required } from '../../validations/decorators';

export enum GeoObjectType {
	POINT = 'Point'
}

export class GeoLocation {
	@dbField()
	type: GeoObjectType = GeoObjectType.POINT;

	// @jsonProperty() @required() @min(-90) @max(90)
	_lat: number;

	// @jsonProperty() @required() @min(-180) @max(180)
	_lng: number;

	@jsonProperty()
	@required()
	@min(-180)
	@max(180)
	get lng(): number {
		return this._lng;
	}

	set lng(lng: number) {
		this._lng = lng;
		this.coordinates[0] = lng;
	}

	@jsonProperty()
	@required()
	@min(-90)
	@max(90)
	get lat(): number {
		return this._lat;
	}

	set lat(lat: number) {
		this._lat = lat;
		this.coordinates[1] = lat;
	}

	@dbField({ type: Number })
	_coordinates: number[] = [];

	@dbField({ type: Number })
	get coordinates(): number[] {
		return this._coordinates;
	}

	set coordinates(coords: number[]) {
		this._coordinates = coords;
		this.lng = coords[0];
		this.lat = coords[1];
	}

	get locLink(): string {
		return `https://maps.google.com/?q=${this._lat},${this._lng}`;
	}

}
