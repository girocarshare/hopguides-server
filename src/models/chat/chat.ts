import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { validEnum } from '../../validations/decorators';
import { Message } from './message';

export class Chat {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	sender: string;

	@jsonProperty()
	@dbField()
	receiver: string;

	@jsonProperty({ type: String })
	@dbField({ type: String })
	@validEnum(Message)
	history: Message[] = [];

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	modifiedAt: number;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	createdAt: number = Date.now();
}
