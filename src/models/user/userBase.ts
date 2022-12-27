import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { UserRoles, UserStatus } from './user';
import { UserSettings } from './userSettings';

export class UserBase {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	avatarURL: string;

	@jsonProperty()
	@dbField()
	firstName: string = null;

	@jsonProperty()
	@dbField()
	lastName: string = null;

	@jsonProperty()
	@dbField()
	imageUrl: string = null;

	@jsonProperty()
	@dbField()
	phone: string;

	@jsonProperty()
	@dbField()
	email: string;

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	role: UserRoles;

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	status: UserStatus = UserStatus.PENDING; // this status is for CarShare

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	statusMB: UserStatus = UserStatus.PENDING; // this status is for Mobility

	@jsonProperty()
	@dbField()
	allowPromo: boolean;

	@jsonProperty()
	@dbField()
	settings: UserSettings = new UserSettings();


	constructor(id?: string, firstName?: string, lastName?: string, avatarURL?: string) {
		if (!id) return;
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.avatarURL = avatarURL;
	}

	get name(): string {
		return this.firstName + ' ' + this.lastName;
	}
}
