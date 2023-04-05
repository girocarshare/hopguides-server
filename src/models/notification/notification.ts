import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import type { User } from '../user/user';
import type { NotificationChannel } from './notificationChannel';
import { NotificationPriority } from './notificationPriority';
import { NotificationType } from './notificationType';
//import { PushDataType } from '../../classes/notification/push';

export class NotificationTemplate {
//	@dbField()
	//@jsonProperty()
	//push: PushDataType = null;

	@dbField()
	@jsonProperty()
	email: string = null;

	@dbField()
	@jsonProperty()
	sms: string = null;

	@dbField()
	@jsonProperty()
	chat: string = null;
}

export class Notification {
	@jsonProperty()
	@dbField()
	@id()
	notificationType: NotificationType;

	@jsonProperty()
	@dbField()
	priority: NotificationPriority;

	@jsonProperty()
	@dbField()
	adminTemplate: NotificationTemplate;

	@jsonProperty()
	@dbField()
	customerTemplate: NotificationTemplate;

	@jsonProperty()
	@dbField()
	ownerTemplate: NotificationTemplate;

	@jsonProperty()
	@dbField()
	emailSubject: string;

	getNotificationChannelsForUser(user: User): NotificationChannel[] {
		const userNotificationChannels: NotificationChannel[] = user.settings.notifications.getEnabledChannels();
		return this.getTopNotificationChannels(userNotificationChannels);
	}

	getTopNotificationChannels(
		userNotificationChannels: NotificationChannel[]
	): NotificationChannel[] {
		let maxPriority = -1;
		for (const userChannel of userNotificationChannels)
			if (this.priority[userChannel] > maxPriority) maxPriority = this.priority[userChannel];

		if (maxPriority === -1) return [];
		const topNotificationChannels: NotificationChannel[] = [];
		for (const userChannel of userNotificationChannels) {
			if (this.priority[userChannel] === maxPriority)
				topNotificationChannels.push(userChannel);
		}
		return topNotificationChannels;
	}
}
