import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { email, max } from '../../validations/decorators';
import { eighteenYearsOld } from '../../utils/utils';
import { ChangeLog } from '../classes';
import { StatusTxt } from '../../utils/valu/enums';
import { UserBase } from './userBase';
import { UserSettings, UserSettingsMB } from './userSettings';
//import { double } from 'aws-sdk/clients/lightsail';
import { OTPCode } from './OTPCode';
import { PromoBalance } from './promoBalance';

export enum UserStatus {
	DELETE = 'DELETE',
	BANNED = 'BANNED',
	UNVERIFIED = 'UNVERIFIED',
	PENDING = 'PENDING',
	VERIFIED = 'VERIFIED'
}

export enum UserRoles {
	USER = 'USER',
	PROVIDER = 'PROVIDER',
	ADMIN = 'ADMIN',
	BPARTNER = 'BPARTNER',
}

export enum VerificationLevel {
	RENT = 'RENT',
	RIDESHARE = 'RIDESHARE',
	CARSHARE = 'CARSHARE'
}

export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE'
}

export enum Avatar {
	'https://giromobility-live.imgix.net/nodelete/avtr1.jpg?q=75&w=200',
	'https://giromobility-live.imgix.net/nodelete/avtr2.jpg?q=75&w=200',
	'https://giromobility-live.imgix.net/nodelete/avtr3.jpg?q=75&w=200',
	'https://giromobility-live.imgix.net/nodelete/avtr4.jpg?q=75&w=200',
	'https://giromobility-live.imgix.net/nodelete/avtr5.jpg?q=75&w=200'
}

export class User extends UserBase {
	@jsonProperty()
	@dbField()
	avatarURL: string = this.assignAvatarUrl();

	@jsonProperty()
	@dbField()
	firstName: string;

	@jsonProperty()
	@dbField()
	lastName: string;

	@email()
	@jsonProperty()
	@dbField()
	email: string = null;

	@jsonProperty()
	@email()
	@dbField()
	notificationEmail: string = null;

	@jsonProperty({ deserialize: false, serialize: true })
	@dbField()
	role: UserRoles = UserRoles.USER;

	@dbField()
	confirmed = false;
	
	@dbField()
	invited = false;

	@jsonProperty()
	@dbField()
	@max(eighteenYearsOld())
	birthDate: number = null;

	@jsonProperty()
	@dbField()
	gender: Gender = null;

	@jsonProperty()
	@dbField()
	phone: string = null;

	@jsonProperty()
	@dbField()
	personalId: string = null; // as TAX NUMBER

	// PAYWISER
	@dbField()
	pGReferenceID: string = null;

	@dbField()
	cardDate: string = null;

	@dbField()
	cardMask: string = null;

	@jsonProperty()
	@dbField()
	autoTopUp = true;

	@jsonProperty()
	@dbField()
	valuTSID: string = null;

	@jsonProperty()
	@dbField()
	valuStatus: string = null;

	// OTHER

	@jsonProperty()
	@dbField()
	verification: OTPCode = new OTPCode();

	@jsonProperty()
	@dbField()
	settings: UserSettings = new UserSettings();

	@jsonProperty()
	@dbField()
	settingsMB: UserSettingsMB = new UserSettingsMB();

	@jsonProperty()
	@dbField()
	allowPromo = true;

	@jsonProperty()
	@dbField()
	allowPromoMB = true;

	@jsonProperty()
	@dbField()
	password: string;

	@dbField()
	salt: string;

	@dbField()
	confirmationToken: string;

	@dbField()
	passwordResetToken: string;

	@jsonProperty()
	@dbField()
	firebaseToken: string = null;

	@jsonProperty()
	@dbField()
	firebaseTokenMB: string = null;

	@jsonProperty()
	@dbField()
	expoPushToken: string = null;

	@jsonProperty()
	@dbField()
	ThreeDSecureReferenceID: string = null;

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	createdAt: number = Date.now();

	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	modifiedAt: number;

	@dbField()
	@jsonProperty()
	changeLog: ChangeLog = new ChangeLog();

	constructor() {
		super();
	}

	hasRequiredFields(): boolean {
		return (
			Boolean(this.firstName) &&
			Boolean(this.lastName) &&
			Boolean(this.confirmed) &&
			Boolean(this.phone) &&
			Boolean(this.notificationEmail) &&
			// !!this.email &&
			Boolean(this.gender) &&
			Boolean(this.birthDate) &&
			Boolean(this.personalId) 
		);
	}


	hasPaymentMethod(): boolean {
		return (
			(Boolean(this.pGReferenceID) && Boolean(this.cardMask)) ||
			(Boolean(this.valuTSID) && this.valuStatus === StatusTxt.ContractConfirmed)
		);
	}


	getCardMask(): string {
		return this.cardMask;
	}

	getVerificationLvl(): VerificationLevel {
		const levelRent: boolean = Boolean(this.phone) && Boolean(this.firstName) && Boolean(this.lastName);
		const levelRideSharing: boolean =
			Boolean(this.phone) && Boolean(this.firstName) && Boolean(this.lastName) && Boolean(this.avatarURL) && Boolean(this.email);
		const levelCarSharing: boolean =
			Boolean(this.avatarURL) &&
			Boolean(this.firstName) &&
			Boolean(this.lastName) &&
			Boolean(this.phone) &&
			Boolean(this.email) &&
			Boolean(this.birthDate) &&
			Boolean(this.gender) &&
			Boolean(this.personalId) 

		if (levelCarSharing) return VerificationLevel.CARSHARE;
		else if (levelRideSharing) return VerificationLevel.RIDESHARE;
		else if (levelRent) return VerificationLevel.RENT;
	}

	assignAvatarUrl(): string {
		return Avatar[Math.floor(Math.random() * 6)];
	}
}
