import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { NotificationChannel } from '../notification/notificationChannel';

export class UserNotifications {
	@jsonProperty()
	@dbField()
	emailEnabled: boolean = true;

	@jsonProperty()
	@dbField()
	smsEnabled: boolean = true;

	@jsonProperty()
	@dbField()
	pushEnabled: boolean = true;

	getEnabledChannels(): NotificationChannel[] {
		const channels: NotificationChannel[] = [];
		for (const channel of Object.keys(NotificationChannel))
			if (channel + 'Enabled') channels.push(NotificationChannel[channel]);

		return channels;
	}
}
