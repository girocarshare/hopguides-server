import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class Maintenance {
	@jsonProperty({ type: String })
	@dbField({ type: String })
	managers: string[] = [];

	@jsonProperty({ type: String })
	@dbField({ type: String })
	servicers: string[] = [];
}
