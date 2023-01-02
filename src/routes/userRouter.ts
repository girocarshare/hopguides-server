//import { TransactionManager } from './../manager/transactionManager';
import { User, UserRoles, UserStatus } from '../models/user/user';
//import { RideManager } from '../manager/rideManager';
//import * as multer from 'multer';
import { CustomError } from '../classes/customError';
import { IRequest, IResponse, MulterFile } from '../classes/interfaces';
//import { LoginPayloadOLD } from '../classes/user/loginPayload';
//import { UserPatchPayload } from '../classes/user/userPatchPayload';
import { deserialize, serialize } from '../json';
//import { BookingManager } from '../manager/bookingManager';
//import { CarManager } from '../manager/carManager';
import { UserManager } from '../manager/userManager';
import {
	/*AdminRole,
	allowFor,
	capitalizeEvery,
	deleteUndefinedFields,
	generateInviteCode,
	ManagerRole,
	paramCheck,
	ServiceRole,
	SupportRole,
	UserRoleWith,*/
	withErrorHandler
} from '../utils/utils';
//import { validateOrThrow } from '../validations';
import { BaseRouter } from './baseRouter';
/*import { UserCarRouter } from './userCarRouter';
import { sendSMSMB } from '../utils/sms';
import { SearchPagination } from '../classes/searchPagination';
import { SearchUsersFilter } from '../classes/searchUsersFilter';
import { NotificationManager } from '../manager/notificationManager';
import { serializeForDb } from '../db/dbUtils';
import { addContact } from '../utils/mail/utils';
import * as moment from 'moment';
import { Vehicle } from '../models/car/car';
import { Transaction } from '../models/transaction';
*/
function performBasicChecks(user: User): void {
	/** Check if user not BANNED  
	if (user.statusMB === UserStatus.BANNED) throw new CustomError(443, 'User is banned');*/
}

	export class UserRouter extends BaseRouter {
		userManager: UserManager;
		/*bookingManager: BookingManager;
		rideManager: RideManager;
		carManager: CarManager;
		notificationManager: NotificationManager;
		userCarRouter: UserCarRouter;
		transactionManager: TransactionManager;

		upload: any;*/

		constructor() {
			super();
			//this.upload = multer();
			this.userManager = new UserManager();
			/*this.bookingManager = new BookingManager();
			this.rideManager = new RideManager();
			this.carManager = new CarManager();
			this.notificationManager = new NotificationManager();
			this.userCarRouter = new UserCarRouter();
			this.transactionManager = new TransactionManager();*/
			this.init();
		}

		init(): void {
			/*this.router.post(
				'/:userId/uploadICON',
				allowFor([AdminRole]),
				this.upload.single('file'),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					await this.userManager.getUser(req.params.userId);
					const file: MulterFile = req.file;
					if (!file) return res.throwErr(new CustomError(400, 'No file found'));
					const uploadedUrl: string = await this.userManager.uploadICON(file);
					return res.respond(200, uploadedUrl);
				})
			); 
			
	*/

			this.router.post(
				'/addUser',
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const createdUser: User = await this.userManager.createUser(
						deserialize(User, req.body));

				
					//const createdUser: User = await this.userManager.createUser(userData);

					//console.log(createdUser)
					return res.status(200).send(createdUser);
				})
			);

			// GET fetches users list for admin panel 
		/*	this.router.get(
				'/',
				allowFor([AdminRole, SupportRole]),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const pagination: SearchPagination = new SearchPagination(req.query);
					const filter: SearchUsersFilter = SearchUsersFilter.build(req.query);
					const users: User[] = await this.userManager.getUsersFilter(filter, pagination);
					return res.respond(
						200,
						users.map(u => serialize(u))
					);
				})
			);

			/** GET fetches the number of all users  
			this.router.get(
				'/count',
				allowFor([AdminRole, SupportRole]),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const count: number = await this.userManager.countUsers();
					return res.respond(200, count);
				})
			);
	
			/** POST ADMIN dashboard login with email  
			this.router.post(
				'/signinAdmin',
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const login: LoginPayloadOLD = deserialize(LoginPayloadOLD, req.body);
					validateOrThrow(login);
					let user: User = await this.userManager.getUserByEmail(login.email);
					/** START OF SECURITY CHECKS  
					performBasicChecks(user);
					/** END OF SECURITY CHECKS  
					if (!user || user.roleMB === UserRoles.USER)
						return res.throwErr(new CustomError(404, 'User not ADMIN'));
	
					const code: string = Math.floor(100000 + Math.random() * 900000).toString();
					user = await this.userManager.addVerificationCode(user.id, code);
					await sendSMSMB(user, 'GoGiro Dash login code: ' + code);
	
					return res.respond(200, true);
				})
			);
	
			/** POST ADMIN dashboard login with email  
			this.router.post(
				'/loginAdmin',
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const login: LoginPayloadOLD = deserialize(LoginPayloadOLD, req.body);
					validateOrThrow(login);
					const user: User = await this.userManager.getUserByEmail(login.email);
					if (!user || user.roleMB === UserRoles.USER)
						return res.throwErr(new CustomError(404, 'User not ADMIN'));
					/** START OF SECURITY CHECKS  
					performBasicChecks(user);
					/** END OF SECURITY CHECKS  
					if (user.verification.createdAt + 180000 > Date.now()) {
						if (user.verification.verificationCode === login.password) {
							const loggedUserData: {
								userData: User;
								userJwt: string;
							} = await this.userManager.loginUser(user);
							res.append('accessToken', loggedUserData.userJwt);
							return res.respond(200, serialize(loggedUserData.userData));
						} else return res.throwErr(new CustomError(421, 'Wrong verification code'));
					} else return res.throwErr(new CustomError(422, 'Code is no longer valid'));
				})
			);
	
			/**
			 * GET fetches user data
			  
			this.router.get(
				'/:userId',
				allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const user: User = await this.userManager.getUser(req.params.userId);
					/** START OF SECURITY CHECKS  
					performBasicChecks(user);
					/** END OF SECURITY CHECKS  
					return res.respond(200, user);
				})
			);
	
			/**
			 * PATCH updates user data of user
			  
			this.router.patch(
				'/:userId',
				allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const user: User = await this.userManager.getUser(req.params.userId);
					/** START OF SECURITY CHECKS  
					performBasicChecks(user);
					/** END OF SECURITY CHECKS  
					const userPatchPayload: UserPatchPayload = deserialize(UserPatchPayload, req.body);
					deleteUndefinedFields(userPatchPayload);
					validateOrThrow(userPatchPayload);
	
					/** patch in invite code as well, is this useful ?  
					if (!req?.user?.inviteCode && userPatchPayload.firstName) {
						userPatchPayload.inviteCode = generateInviteCode(userPatchPayload.firstName);
					}
	
					/** Fix names  
					if (userPatchPayload.firstName) {
						/** Check for firstName  
						userPatchPayload.firstName = capitalizeEvery(userPatchPayload.firstName);
					}
					if (userPatchPayload.lastName) {
						/** Check for lastName  
						userPatchPayload.lastName = capitalizeEvery(userPatchPayload.lastName);
					}
					if (userPatchPayload.email) {
						/** Check for email  
						userPatchPayload.notificationEmail = userPatchPayload.email;
					}
	
					userPatchPayload.modifiedAt = Date.now();
					userPatchPayload['changeLog.changedBy'] = req.userId;
					userPatchPayload['changeLog.changedAt'] = Date.now();
	
					const serializedData = serializeForDb(userPatchPayload);
	
					const patchedUser: User = await this.userManager.updateUser(
						user.id,
						serializedData
					);
	
					/** If added E-mail and promotions are enabled  
					if (
						((!user.notificationEmail && !!patchedUser.notificationEmail) ||
							user.notificationEmail !== patchedUser.notificationEmail) &&
						!!patchedUser.allowPromo
					) {
						/** ADD user to Sendgrid  
						await addContact(patchedUser);
					}
	
					return res.respond(200, patchedUser);
				})
			);
	
			/**
			 * POST upload file like images for user for profile pictures and parking at the end of the ride
			  
			this.router.post(
				'/:userId/uploadAvatar',
				allowFor([
					AdminRole,
					ManagerRole,
					ServiceRole,
					SupportRole,
					UserRoleWith(paramCheck('userId'))
				]),
				this.upload.single('file'),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const user: User = await this.userManager.getUser(req.params.userId);
					/** START OF SECURITY CHECKS  
					performBasicChecks(user);
					/** END OF SECURITY CHECKS  
					const file: MulterFile = req.file;
					if (!file) return res.throwErr(new CustomError(400, 'No file found'));
					const url: string = await this.userManager.uploadFile(user.id, file);
					/** Update User  
					const updateData: User = {} as any;
					updateData.avatarURL = url;
					const updatedUser: User = await this.userManager.updateUser(user.id, updateData);
					return res.respond(200, updatedUser);
				})
			);
	
			/**
			 * POST made for Support to gift X.X € to user
			  
			this.router.post(
				'/:userId/gift',
				allowFor([AdminRole, SupportRole]),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const user: User = await this.userManager.getUser(req.params.userId);
					/** START OF SECURITY CHECKS  
					performBasicChecks(user);
					/** END OF SECURITY CHECKS  
					const amount: number = req.body.amount;
	
					if (amount < 0) return res.throwErr(new CustomError(405, 'Wrong amount'));
					const updatedUser: User = await this.userManager.addGift(user, amount, req.userId);
	
					return res.respond(200, updatedUser);
				})
			);
	
			/**
			 * GET account balance of user based on userId
			  
			this.router.get(
				'/:userId/earnings',
				allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const user: User = await this.userManager.getUser(req.params.userId);
					/** START OF SECURITY CHECKS  
					performBasicChecks(user);
					/** END OF SECURITY CHECKS  
					const accBalance: number = user.getAccountBalance();
					return res.respond(200, accBalance);
				})
			);
	
			/**
			 * GET account balance of user based on userId
			  
			this.router.get(
				'/:userId/infodash',
				allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const user: User = await this.userManager.getUser(req.params.userId);
	
					const allTimeR: {
						rents: number;
						time: number;
						mileage: number;
					} = (await this.bookingManager.getBookingsStat(user.id)) || {
						rents: -1,
						time: -1,
						mileage: -1
					};
	
					const allTimeT: {
						cost: number;
						revenue: number;
						profit: number;
					} = (await this.transactionManager.getEarningsDate(user.id)) || {
						cost: -1,
						revenue: -1,
						profit: -1
					};
	
					const lastMonthStart: number = moment()
						.subtract(1, 'months')
						.startOf('month')
						.startOf('day')
						.valueOf();
					const lastMonthEnd: number = moment()
						.subtract(1, 'months')
						.endOf('month')
						.startOf('day')
						.valueOf();
	
					const lastMonthR: {
						rents: number;
						time: number;
						mileage: number;
					} = (await this.bookingManager.getBookingsStat(
						user.id,
						lastMonthStart,
						lastMonthEnd
					)) || {
							rents: -1,
							time: -1,
							mileage: -1
						};
	
					const lastMonthT: {
						cost: number;
						revenue: number;
						profit: number;
					} = (await this.transactionManager.getEarningsDate(
						user.id,
						lastMonthStart,
						lastMonthEnd
					)) || {
							cost: -1,
							revenue: -1,
							profit: -1
						};
	
					return res.respond(200, {
						tRevenue: allTimeT.revenue,
						tCost: allTimeT.cost,
						tProfit: allTimeT.profit,
						tRents: allTimeR.rents,
						tTime: allTimeR.time,
						tMileage: allTimeR.mileage,
						mRevenue: lastMonthT.revenue,
						mCost: lastMonthT.cost,
						mProfit: lastMonthT.profit,
						mRents: lastMonthR.rents,
						mTime: lastMonthR.time,
						mMileage: lastMonthR.mileage
					});
				})
			);
	
			/**
			 * POST upload file like images for Company owner for company logo
			  
			this.router.post(
				'/:userId/upload/clogo',
				allowFor([AdminRole, ManagerRole]),
				this.upload.single('file'),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const user: User = await this.userManager.getUser(req.params.userId);
					/** START OF SECURITY CHECKS  
					performBasicChecks(user);
					/** END OF SECURITY CHECKS  
					const file: MulterFile = req.file;
					if (!file) return res.throwErr(new CustomError(400, 'No file found'));
					const url: string = await this.userManager.uploadFile(user.id, file);
					/** Update User  
					const updateData: User = {} as any;
					updateData.companyLogo = url;
					const updatedUser: User = await this.userManager.updateUser(user.id, updateData);
					const filter = { userId: user.id };
					const data: Partial<Vehicle> = { cLogo: url };
					await this.carManager.updateVehicles(filter, data);
					return res.respond(200, updatedUser);
				})
			);
	
			/**
			 * POST Refund transaction by transactionId
			  
			this.router.post(
				'/refundTransaction',
				allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole]),
				withErrorHandler(async (req: IRequest, res: IResponse) => {
					const transaction: Transaction = await this.transactionManager.getTransaction(
						req.body.transactionId
					);
	
					const response = await this.userManager.refundTransaction(transaction, req.ip);
					return res.respond(200, response);
				})
			);
		}
	*/
	}
		
	}