import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { GeoLocation } from '../address/geoLocation';
import { LocalizedField } from '../localizedField';

import { generateUuid } from '../../utils/utils';


export class POIVideo {

	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();


	@jsonProperty()
	@dbField()
	text: LocalizedField;

	
	@jsonProperty()
	@dbField()
	video: string;


}
