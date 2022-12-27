import { dbField } from '../db/decorators';
import { jsonProperty } from '../json/decorations';

export class LocalizedField {
	@jsonProperty()
	@dbField()
	en: string;

	@jsonProperty()
	@dbField()
	si: string;
}
