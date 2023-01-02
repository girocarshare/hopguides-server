import { UserBase } from './../models/user/userBase';
//import { NotificationManager } from './notificationManager';
//import { CONSTANTS } from '../utils/constants';
import { CustomError } from '../classes/customError';
import { MulterFile } from '../classes/interfaces';
import { serializeForDb } from '../db/dbUtils';
import UserRepo, { UserRepository } from '../db/repository/userRepository';
//import { ICreditCardPayload } from '../models/paywiser/creditCard';
import { User, UserStatus, UserRoles } from '../models/user/user';
/*import {
	payTopUp,
	payWith3DSec,
	payWithout3DSec,
	refund,
	reserveFunds,
	tokenizeCard,
	tokenizeCard3D,
	voidReservation
} from '../utils/paywiser';
import { S3Service } from '../utils/s3Service';
import { generateJwt, roundToTwoDecimal } from '../utils/utils';
import { SearchUsersFilter } from '../classes/searchUsersFilter';
import { SearchPagination } from '../classes/searchPagination';
import { TransactionManager } from './transactionManager';
import { encrypt } from '../utils/crypto';
import { ValuManager } from './valuManager';
import { StatusTxt } from '../utils/valu/enums';
import { PromotionsManager } from './promotionsManager';
import { checkPromoConditions } from '../utils/promo/utils';
import { Transaction, TransactionSuccess, TransactionType } from '../models/transaction';
import { PromoCode, PromoType } from '../models/promotion/promotion';
import { PaymentType } from '../models/booking/booking';
import { Tour } from '../models/tours/tour';*/
import { Logger } from 'tslog';

export class UserManager {
	userRepository: UserRepository;
	//valuManager: ValuManager;
	//transactionManager: TransactionManager;
	//s3Service: S3Service;
	//promotionsManager: PromotionsManager;
	logger: Logger = new Logger();

	constructor() {
		this.userRepository = UserRepo;
	//	this.promotionsManager = new PromotionsManager();
	//	this.valuManager = new ValuManager();
	//	this.transactionManager = new TransactionManager();
	//	this.s3Service = new S3Service(process.env.AWS_BUCKET_NAME);
	}

	/*async getUserByPhone(phoneNumber: string): Promise<User> {
		return await this.userRepository.findOne({ phone: phoneNumber }).catch(() => {
			throw new CustomError(404, `User ${phoneNumber} not found!`);
		});
	}

	async getUserByEmail(email: string): Promise<User> {
		return await this.userRepository.findOne({ email: email.toLowerCase() }).catch(() => {
			throw new CustomError(404, `User ${email.toLowerCase()} not found!`);
		});
	}

	async getInviteByCode(code: string): Promise<string> {
		const inviter: User = await this.userRepository.findOne({ inviteCode: code.toUpperCase() });
		return inviter ? inviter.id : null;
	}

	async getInviterByCode(code: string): Promise<User> {
		return (await this.userRepository.findOne({ inviteCode: code.toUpperCase() })) || null;
	}

	async getUser(userId: string): Promise<User> {
		return await this.userRepository.getByIdOrThrow(userId).catch(() => {
			throw new CustomError(404, 'User not found!');
		});
	}

	async getRenter(userId: string): Promise<User> {
		return (await this.userRepository.findOne({ _id: userId })) || null;
	}

	async getUsers(filter?: any, pagination?: SearchPagination): Promise<User[]> {
		return await this.userRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting all Users');
		});
	}

	async getUsersFilter(
		filter: SearchUsersFilter,
		pagination?: SearchPagination
	): Promise<User[]> {
		return await this.userRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting all Users');
		});
	}

	async getAllServicers(): Promise<UserBase[]> {
		return await this.userRepository
			.getAll({ roleMB: { $in: [UserRoles.SERVICE, UserRoles.ADMIN] } })
			.catch(() => {
				throw new Error('Error getting all Users');
			});
	}

	async getVehServicers(userIds: string[]): Promise<UserBase[]> {
		return await this.userRepository
			.getAll({ _id: { $in: userIds }, roleMB: UserRoles.SERVICE })
			.catch(() => {
				throw new Error('Error getting all Users');
			});
	}

	async getAllManagers(): Promise<UserBase[]> {
		return await this.userRepository
			.getAll({ roleMB: { $in: [UserRoles.MANAGER, UserRoles.ADMIN] } })
			.catch(() => {
				throw new Error('Error getting all Users');
			});
	}

	async getVehManagers(userIds: string[]): Promise<UserBase[]> {
		return await this.userRepository
			.getAll({ _id: { $in: userIds }, roleMB: UserRoles.MANAGER })
			.catch(() => {
				throw new Error('Error getting all Users');
			});
	}

	async countUsers(): Promise<number> {
		return await this.userRepository.count().catch(() => {
			throw new Error('Error counting Users');
		});
	}

	async updateUser(userId: string, data: Partial<User>): Promise<User> {
		return await this.userRepository.updateOne(userId, data);
	}

	async deleteUser(userId: string): Promise<boolean> {
		return await this.userRepository.deleteOne({ _id: userId });
	}*/

	async createUser(user: User): Promise<User> {
		// search for user, check if it exists, if it does, check for the fields of confirmed and createdAt
		let createdUser: User = await this.userRepository.findOne({ phone: user.phone });
		if (!createdUser) createdUser = await this.userRepository.createOne(user);
		// await sendRegistrationMail(createdUser, notification.emailTemplate);
		else if (createdUser.statusMB === UserStatus.BANNED)
			throw new CustomError(403, 'User blacklisted');
		else if (createdUser.statusMB === UserStatus.VERIFIED)
			throw new CustomError(408, 'User exists');
		else createdUser = await this.userRepository.replaceOne(createdUser.id, user);

		return createdUser;
	}
/*
	async confirmUser(confirmationToken: string): Promise<User> {
		const user: User = await this.userRepository.findOne({
			confirmationToken: confirmationToken
		});
		if (!user) throw new CustomError(404, 'User not found');
		return await this.userRepository.updateOne(user.id, {
			confirmed: true,
			modifiedAt: Date.now()
		});
	}

	async loginUser(user: User): Promise<{ userData: User; userJwt: string }> {
		if (!user) throw new CustomError(401, "User doesn't exist!");
		if (!user.confirmed) throw new CustomError(403, 'User not confirmed');
		if (user.statusMB === UserStatus.BANNED) throw new CustomError(401, 'Banned');
		return { userData: user, userJwt: generateJwt(user) };
	}

	async uploadICON(file: MulterFile): Promise<string> {
		return await this.s3Service.uploadICONFile(file).catch(() => {
			throw new Error('Error uploading ICON');
		});
	}

	async uploadFile(userId: string, file: MulterFile): Promise<string> {
		return await this.s3Service.uploadUserFile(userId, file).catch(() => {
			throw new Error('Error uploading file');
		});
	}

	async __uploadFile(userId: string, file: MulterFile): Promise<User> {
		const url = await this.s3Service.uploadUserFile(userId, file).catch(() => {
			throw new Error('Error uploading file');
		});
		/** Update User 
		const updateData: User = {} as any;
		updateData.avatarURL = url;
		return this.updateUser(userId, updateData);
	}

	async addVerificationCode(userId: string, verificationCode: string): Promise<User> {
		const user: User = await this.userRepository.getByIdOrThrow(userId);
		user.verification.verificationCode = verificationCode;
		user.verification.createdAt = Date.now();
		if (!user?.infoGDPR?.joinedMobility) {
			user.infoGDPR.joinedMobility = Date.now();
		}
		const serializedData = serializeForDb(user);
		return await this.userRepository.updateOne(user.id, serializedData);
	}

	/** BALANCE 

	async addPaymentMethod(
		userId: string,
		card: ICreditCardPayload,
		buyerIp: string
	): Promise<User> {
		const user: User = await this.userRepository.findOne({ _id: userId });
		if (!user) throw new CustomError(401, "User doesn't exist");
		if (!user.confirmed) throw new CustomError(403, 'User not confirmed');
		if (user.statusMB === UserStatus.BANNED) throw new CustomError(401, 'User banned');
		if (!card.CardNumber || !card.CardExpDate || !card.CardSecurityCode)
			throw new CustomError(404, 'Missing card data');

		const createdCard: any = await tokenizeCard(card, user);
		// todo : this was broken
		if (createdCard.TransactionStatusCode !== 20000) {
			this.logger.error(
				`::ERR:: Error TOKENIZE: ${createdCard.TransactionStatusDescription}`
			);
			throw new CustomError(400, createdCard.TransactionStatusDescription);
		}

		const reserve = await reserveFunds(createdCard.PGReferenceID, 1, buyerIp, user.email);
		if (reserve.TransactionStatusCode !== 20000) {
			this.logger.error(`::ERR:: Error RESERVE: ${reserve.TransactionStatusDescription}`);
			throw new CustomError(400, reserve.TransactionStatusDescription);
		} else {
			await voidReservation(reserve.PGReferenceID);
		}
		const updateData: User = {} as any;

		if (process.env.ENV !== 'prod') {
			updateData.cardDate = encrypt('12/2024');
		} else {
			//        read PCI-DSS standards for more info
			//        https://en.wikipedia.org/wiki/Payment_Card_Industry_Data_Security_Standard
			//		  TLDR;
			//			to be concise, storing in any manner (that is reversible) credit card data
			//          not being a level 7 security compliant company (with a same security
			//          architecture) is illegal and is persecuted in many EU countries.
			//        if desired a SHA-512 or a double-SHA-256 of the card number may be
			//	      stored just for future comparison. Line commented on 2020/08/05
			// updateData.cardDate = encrypt(card.CardExpDate);
		}
		updateData.pGReferenceID = createdCard.PGReferenceID;
		updateData.cardMask = `${card?.CardNumber.substring(
			0,
			4
		)} **** **** ${card?.CardNumber.substring(card?.CardNumber.length - 4)}`;

		updateData.valuStatus = StatusTxt.Undefined;
		return await this.updateUser(user.id, updateData);
	}

	async setBalance(userId: string, amount: number): Promise<User> {
		return await this.userRepository.incrementOne(userId, { balance: amount }).catch(() => {
			throw new Error('Error updating balance');
		});
	}

	async setEarnings(userId: string, amount: number): Promise<User> {
		return await this.userRepository.incrementOne(userId, { earnings: amount }).catch(() => {
			throw new Error('Error updating earnings');
		});
	}

	async setPromoBalance(userId: string, amount: number): Promise<User> {
		return await this.userRepository
			.incrementOne(userId, { 'pBalance.mbBalance': amount, balance: amount })
			.catch(() => {
				throw new Error('Error updating promo balance');
			});
	}

	async addBalance(
		user: User,
		buyerIp: string,
		amount: number
	): Promise<{
		userData: User;
		transData: Transaction;
		promoData: PromoCode;
	}> {
		try {
			let giftedAmount: number = 0;
			let usedPromotion: PromoCode = null;

			const eligibleList: PromoCode[] = await this.promotionsManager.getList(user.id);

			const promoDiscount: PromoCode = eligibleList.find(
				el => el.type === PromoType.DISCOUNT
			);
			/** Handle topup discount promotions 
			if (promoDiscount) {
				if (promoDiscount.usedBy.indexOf(user.id) > -1)
					throw new Error('Promotion already used');
				if (promoDiscount.type === PromoType.DISCOUNT) {
					if (checkPromoConditions(promoDiscount, user.id, amount)) {
						if (promoDiscount.percent) {
							/** Discount for percent value | value should be under 100   
							giftedAmount += Math.abs(amount * (promoDiscount.value / 100));
							amount -= Math.abs(amount * (promoDiscount.value / 100));
						} else {
							/** Discount for fixed value  
							giftedAmount += promoDiscount.value;
							amount -= promoDiscount.value;
						}
						usedPromotion = promoDiscount;
					}
				}
			}

			const paymentSuccessful: { paymentId: string; simplePayId: string } =
				user.valuStatus === StatusTxt.ContractConfirmed
					? await this.valuManager.processValuPayment(user, amount)
					: await payTopUp(user, amount, buyerIp);
			this.logger.info('Payment SUCCESS = ' + paymentSuccessful);
			if (!paymentSuccessful) return { userData: user, transData: null, promoData: null };
			const promoMultiplier: PromoCode = eligibleList.find(
				el => el.type === PromoType.MULTIPLIER
			);
			/** Handle topup multiplier promotions  
			if (promoMultiplier && !promoDiscount) {
				if (promoMultiplier.usedBy.indexOf(user.id) > -1)
					throw new Error('Promotion already used');
				if (promoMultiplier.type === PromoType.MULTIPLIER) {
					if (checkPromoConditions(promoMultiplier, user.id, amount)) {
						/** Multiply topup with percentage | value should be over 100  
						giftedAmount += Math.abs((amount * promoMultiplier.value) / 100 - amount);
						usedPromotion = promoMultiplier;
					}
				}
			}

			/** Handle general top up bonus  
			const topupBonus: PromoCode = await this.promotionsManager.getActiveTopUpBonus();
			if (topupBonus && !promoMultiplier && !promoDiscount) {
				if (checkPromoConditions(topupBonus, user.id, amount)) {
					/** Multiply topup with percentage  
					if (topupBonus.percent) {
						giftedAmount += (amount * topupBonus.value) / 100 - amount;
					} else {
						giftedAmount += amount;
					}
					usedPromotion = topupBonus;
				}
			}

			// Create TRANSACTION for TOPUP
			const transaction: Transaction = await this.transactionManager.createTopUpTrans(
				user,
				buyerIp,
				amount,
				giftedAmount,
				paymentSuccessful.paymentId,
				user.valuStatus === StatusTxt.ContractConfirmed
					? PaymentType.VALU
					: PaymentType.CARD,
				usedPromotion,
				paymentSuccessful.simplePayId
			);
			const updatedUser: User = await this.setBalance(
				user.id,
				Math.abs(roundToTwoDecimal(transaction.amount))
			);
			if (giftedAmount > 0) {
				await this.setPromoBalance(
					user.id,
					Math.abs(roundToTwoDecimal(transaction?.items?.spentPromo))
				);
			}
			if (promoDiscount) await this.promotionsManager.useCode(promoDiscount, user.id);
			if (promoMultiplier) await this.promotionsManager.useCode(promoMultiplier, user.id);
			if (topupBonus) await this.promotionsManager.useCode(topupBonus, user.id);

			return { userData: updatedUser, transData: transaction, promoData: usedPromotion };
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	async payUpFront(user: User, buyerIp: string, amount: number): Promise<any> {
		let data: {
			success: { paymentId: string; simplePayId: string };
			method: PaymentType;
			createdAt: number;
		};

		try {
			// if enough GoGiro cash in wallet use it
			if (user?.getAccountBalance() >= amount) {
				data = {
					success: { paymentId: PaymentType.WALLET, simplePayId: PaymentType.WALLET },
					method: PaymentType.WALLET,
					createdAt: Date.now()
				};
			} else {
				// if NOT enough GoGiro cash in wallet buy it first
				data =
					user.valuStatus === StatusTxt.ContractConfirmed
						? {
							success: await this.valuManager.processValuPayment(user, amount),
							method: PaymentType.VALU,
							createdAt: Date.now()
						}
						: {
							success:
								amount <= 25
									? await payWithout3DSec(user, amount, buyerIp)
									: await payWith3DSec(user, amount, buyerIp),
							method: PaymentType.CARD,
							createdAt: Date.now()
						};

				await this.setBalance(user.id, Math.abs(roundToTwoDecimal(amount))); // add paid amount to wallet...it will be transferred right away
			}
			return data;
		} catch (error) {
			this.logger.error(error);
			return data;
		}
	}

	async addGift(user: User, amount: number, callerId: string): Promise<User> {
		// Create TRANSACTION for GIFT
		const transaction: Transaction = await this.transactionManager.createGiftTrans(
			user.id,
			callerId,
			amount
		);
		return await this.setPromoBalance(user.id, Math.abs(roundToTwoDecimal(transaction.amount)));
	}

	async transferBalance(
		transferId: string,
		senderId: string,
		receiverId: string,
		amount: number,
		paymentId: string,
		transactionType: TransactionType,
		paymentType: PaymentType,
		simplePayId: string = null
	): Promise<Transaction> {
		try {
			const sender: User = await this.getUser(senderId);
			if (sender.getAccountBalance() < 0) return undefined;

			let transaction: Transaction = await this.transactionManager.createRentTrans(
				sender,
				receiverId,
				amount,
				transferId,
				paymentId,
				transactionType,
				paymentType,
				simplePayId
			);

			if (transaction) {
				if (sender.pBalance.mbBalance > 0) {
					/** Update SENDER pBalance  
					await this.setPromoBalance(
						sender.id,
						-Math.abs(roundToTwoDecimal(transaction?.items?.spentPromo))
					);
					amount -= roundToTwoDecimal(transaction?.items?.spentPromo);
				}
				if (roundToTwoDecimal(sender.getAccountBalance() - amount) >= 0) {
					/** Update SENDER balance  
					await this.setBalance(sender.id, -Math.abs(roundToTwoDecimal(amount)));
					/** Update RECEIVER earnings  
					await this.setEarnings(
						receiverId,
						Math.abs(roundToTwoDecimal(transaction.items.earnedAmount))
					);
					/** Update SYSTEM earnings  
					await this.setEarnings(
						CONSTANTS.systemUserID,
						Math.abs(roundToTwoDecimal(transaction.items.serviceFee))
					);
				} else {
					await this.userRepository.updateOne(sender.id, { balance: 0 }).catch(() => {
						throw new Error('Error updating balance');
					});
				}
				/** Update Transaction as SUCCESSFUL  
				transaction = await this.transactionManager.updateTransaction(transaction.id, {
					transactionProcessed: TransactionSuccess.SUCCESS
				});

				return transaction;
			}
			return undefined;
		} catch (error) {
			this.logger.error(error);
		}
	}

	/**
	 * Automatic topup for 5€ for user
	 * @param userId
	 * @returns new balance or false or error
	  
	async autoTopUp(user: User, ip: string): Promise<User> {
		const payData: {
			userData: User;
			transData: Transaction;
			promoData: PromoCode;
		} = await this.addBalance(user, ip, 5.0);
		if (payData?.userData?.getAccountBalance() > user?.getAccountBalance()) {
			const notificationManager: NotificationManager = new NotificationManager();
			await notificationManager.receiptForTopUp(payData?.userData, 5.0);
		}
		return payData?.userData;
	}

	async tokenize3D(
		user: User,
		buyerIP: string,
		amount: number,
		card: ICreditCardPayload
	): Promise<any> {
		const response = await tokenizeCard3D(card, user, buyerIP, amount);
		if (!response) throw new CustomError(488, 'Problem with paywiser');
		if (response.TransactionStatusCode === 20000) {
			const updateData: Partial<User> = {
				ThreeDSecureReferenceID: response.ThreeDSecureResponse.ThreeDSecureReferenceID
			};
			await this.updateUser(user.id, updateData);
		}
		return response;
	}

	async payForTour(
		tour: Tour,
		vehicleCount: number,
		buyerIP: string,
		user: User
	): Promise<
		[
			{
				success: { paymentId: string; simplePayId: string };
				method: PaymentType;
				createdAt: number;
			}
		]
	> {
		const payments: any = [];
		// Here we don't make any transactions.
		// There could be a problem that refund for some reason doesn't work
		// and we don't have any record of it
		for (let i = 0; i < vehicleCount; i++) {
			const paymentData: {
				success: { paymentId: string; simplePayId: string };
				method: PaymentType;
				createdAt: number;
			} = await this.payUpFront(user, buyerIP, tour.price);
			if (!paymentData?.success) {
				// TODO: REFUND
				for (let j = 0; j < i; j++) {
					// Subtract funds already placed inside wallet
					await this.setBalance(user.id, -Math.abs(roundToTwoDecimal(tour.price)));
					// Refund already payed amount
					await refund(tour.price, payments[j].success.paymentId, buyerIP);
				}
				throw new CustomError(412, 'Payment unsuccessfull');
			} else {
				payments.push(paymentData);
			}
		}
		return payments;
	}

	async refundTransaction(transaction: Transaction, ip: string): Promise<Transaction> {
		let response: any;
		switch (transaction.paymentType) {
			case PaymentType.CARD:
				response = await refund(transaction.amount, transaction.payId, ip);
				if (response.TransactionStatusCode !== 20000) {
					throw new CustomError(
						412,
						`Refund error: ${response.TransactionStatusDescription}`
					);
				}
				break;
			case PaymentType.VALU:
				await this.valuManager.cancelReservation(
					await this.getUser(transaction.payedBy),
					transaction.payId
				);
				break;
			//  This does not subtract earnings from user in payedTo
			case PaymentType.WALLET:
				await this.setBalance(
					transaction.payedBy,
					Math.abs(roundToTwoDecimal(transaction.amount))
				);
				break;
			default:
				break;
		}
		return await this.transactionManager.updateTransaction(transaction.id, {
			transType: TransactionType.REFUND
		});
	}

	async getAggregatedForExport(startInterval: number, endInterval: number): Promise<any> {
		const aggregationFilter: any = [
			{
				$match: {
					$and: [
						{ modifiedAt: { $gte: startInterval } },
						{ modifiedAt: { $lte: endInterval } }
					]
				}
			},
			{
				$project: {
					id: '$_id',
					statusMB: { $ifNull: ['$statusMB', null] },
					roleMB: { $ifNull: ['$roleMB', null] },
					inviteCode: { $ifNull: ['$inviteCode', null] },
					invitedBy: { $ifNull: ['$invitedBy', null] },
					settings: { $ifNull: ['$settings', null] },
					balance: { $ifNull: ['$balance', null] },
					autoTopUp: { $ifNull: ['$autoTopUp', null] },
					allowPromoMB: { $ifNull: ['$allowPromoMB', null] },
					verification: { $ifNull: ['$verification', null] },
					pGReferenceID: { $ifNull: ['$pGReferenceID', null] },
					valuTSID: { $ifNull: ['$valuTSID', null] },
					modifiedAt: { $ifNull: ['$modifiedAt', null] },
					createdAt: { $ifNull: ['$createdAt', null] }
				}
			}
		];
		return await this.userRepository.aggregate(aggregationFilter);
	}*/
}
