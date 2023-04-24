import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';


export class PoiHelp {
	@jsonProperty()
	@dbField()
	id: string;

	@jsonProperty()
	@dbField()
	used: boolean;

	@jsonProperty()
	@dbField()
	qrCode: string;

	
	@jsonProperty()
	@dbField()
	name: string;

}
