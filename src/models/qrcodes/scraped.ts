import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';

export class Scraped {
	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	_id: string;
	
	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	documentstext: string;	
    
    @dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	scrapedwebsite: string;
	
	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	hotel: string;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	email: string;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	website: string;
}
