import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class Message {
	@jsonProperty()
	@dbField()
	sender: string;

	@jsonProperty()
	@dbField()
	receiver: string;

	@jsonProperty()
	@dbField()
	text: string;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	createdAt: number = Date.now();
}
