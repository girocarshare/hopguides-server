import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { valid } from '../../validations/decorators';
import { UserNotifications } from './userNotifications';

export enum Language {
	SLOVENIAN = 'SI',
	ENGLISH = 'EN'
}

export class UserSettings {
	@jsonProperty()
	@dbField()
	@valid()
	notifications: UserNotifications = new UserNotifications();

	@jsonProperty()
	@dbField()
	language: Language = Language.ENGLISH;
}

export class UserSettingsMB {
	@jsonProperty()
	@dbField()
	@valid()
	notifications: UserNotifications = new UserNotifications();

	@jsonProperty()
	@dbField()
	language: Language = Language.ENGLISH;

	@jsonProperty()
	@dbField()
	showWarnA = true;
}
