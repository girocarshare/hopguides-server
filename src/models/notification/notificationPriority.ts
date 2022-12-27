import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class NotificationPriority {
	@jsonProperty()
	@dbField()
	email: number = -1;

	@jsonProperty()
	@dbField()
	push: number = -1;

	@jsonProperty()
	@dbField()
	sms: number = -1;

	// Add notification channel
}
