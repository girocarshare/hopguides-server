import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';

export class Library {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	url: string;


	@jsonProperty()
	@dbField()
	qrcode: string = null;
	
	@jsonProperty()
	@dbField()
	userId: string = null;

	
}
