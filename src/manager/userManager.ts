import { UserBase } from './../models/user/userBase';
import { CustomError } from '../classes/customError';
import { MulterFile } from '../classes/interfaces';
import { serializeForDb } from '../db/dbUtils';
import UserRepo, { UserRepository } from '../db/repository/userRepository';
import { User, UserStatus, UserRoles } from '../models/user/user';
import { LoginPayload } from '../classes/user/loginPayload';
import { generateJwt } from '../utils/utils';
import { Logger } from 'tslog';
import { create } from 'domain';
import { GeoLocation } from '../models/address/geoLocation';
var bcrypt = require('bcryptjs');
export class UserManager {
	userRepository: UserRepository;
	logger: Logger = new Logger();

	constructor() {
		this.userRepository = UserRepo;
	}
	async getUserByPhone(phoneNumber: string): Promise<User> {
		return await this.userRepository.findOne({ phone: phoneNumber }).catch(() => {
			throw new CustomError(404, `User ${phoneNumber} not found!`);
		});
	}

	async getUser(userId: string): Promise<User> {

		return await this.userRepository.getByIdOrThrow(userId).catch(() => {
		
			throw new CustomError(404, 'User not found!');
		});
	}

	
	async getUserByEmail(email: string): Promise<User> {
		return await this.userRepository.findOne({ email: email }).catch(() => {
			throw new CustomError(404, 'User not found!');
		});
	}
	
	async createUser(user: User): Promise<User> {
		// search for user, check if it exists, if it does, check for the fields of confirmed and createdAt
		let createdUser: User = await this.userRepository.findOne({ email: user.email });


		if (!createdUser) {
			user.password = await bcrypt.hash(user.password, 8)

			user.role = UserRoles.PROVIDER
			createdUser = await this.userRepository.createOne(user);
		}
		// await sendRegistrationMail(createdUser, notification.emailTemplate);
		else if (createdUser.statusMB === UserStatus.BANNED)
			throw new CustomError(403, 'User blacklisted');
		else if (createdUser.statusMB === UserStatus.VERIFIED)
			throw new CustomError(408, 'User exists');
		else createdUser = await this.userRepository.replaceOne(createdUser.id, user);

		return createdUser;
	}

	async sendRegistrationEmail(user: User): Promise<User> {
		
		let createdUser: User = await this.userRepository.findOne({ phone: user.phone });
		if (!createdUser) {
			user.invited = true;
			user.role = UserRoles.PROVIDER;
			createdUser = await this.userRepository.createOne(user);
		}else createdUser = await this.userRepository.replaceOne(createdUser.id, user);

		return createdUser;
	}

	
	async register(user: User): Promise<User> {
		// search for user, check if it exists, if it does, check for the fields of confirmed and createdAt

		
		user.invited = false;
		user.password = await bcrypt.hash(user.password, 8)
		

		// await sendRegistrationMail(createdUser, notification.emailTemplate);
		user = await this.userRepository.replaceOne(user.id, user);

		return user;
	}

	async login(login: LoginPayload): Promise<{ userData: User; userJwt: string }> {
		try{
		var user: User = await this.userRepository.findOne({ email: login.email }).catch(() => {
			throw new CustomError(404, 'User not found!');
		});
		
		const isMatch = await bcrypt.compare(login.password, user.password)
		

		if(isMatch){

			return { userData: user, userJwt: generateJwt(user) };
		}
		else{
			throw new CustomError(401, "Passwords do not match");
		}

	}catch(err){
		console.log(err.error)
	}
	}
}
