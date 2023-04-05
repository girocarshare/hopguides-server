import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class NotificationPriority {
	@jsonProperty()
	@dbField()
	email = -1;

	@jsonProperty()
	@dbField()
	push = -1;

	@jsonProperty()
	@dbField()
	sms = -1;

	// Add notification channel
}
