
import { User, UserRoles, UserStatus } from '../models/user/user';
import { CustomError } from '../classes/customError';
import { IRequest, IResponse, MulterFile } from '../classes/interfaces';
import { LoginPayload } from '../classes/user/loginPayload';
import { deserialize, serialize } from '../json';
import { UserManager } from '../manager/userManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import {
	parseJwt,
	withErrorHandler
} from '../utils/utils';
import { validateOrThrow } from '../validations';
import { BaseRouter } from './baseRouter';
import { BPartner } from '../models/bpartner/bpartner';
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey("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")
var emailSender = "beta-app@gogiro.app";


export class UserRouter extends BaseRouter {
	userManager: UserManager;
	bpartnerManager: BPartnerManager;

	constructor() {
		super();
		this.userManager = new UserManager();
		this.bpartnerManager = new BPartnerManager();
		this.init();
	}

	init(): void {

		this.router.post(
			'/addUser',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				console.log(req.body)
				const createdUser: User = await this.userManager.createUser(
					deserialize(User, req.body));
				return res.status(200).send(createdUser);
			})
		);

		this.router.post(
			'/sendRegistrationEmail',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
			
				console.log(req.body)
				const createdUser: User = await this.userManager.sendRegistrationEmail(
					deserialize(User, req.body));

					var data = {
						contact: {name: req.body.name,
							phone: req.body.phone,
							phone2: req.body.phone2,
							email: req.body.contactEmail,
							webURL: req.body.webURL},
						userId: createdUser.id,
	
	
					}
					const bpartnerData: BPartner = deserialize(
						BPartner,
						data
					);
					const createdBP: BPartner = await this.bpartnerManager.createBP(
						createdUser,
						bpartnerData
						);
	
						sgMail.send({
							to: "lunazivkovic@gmail.com", // change so that poi.contact.email gets email
							from: `${emailSender}`,
							subject: "Set password",
							html: `Dear partner,<br/><br/>
							
							You have been invited to join our platform. Kindly click on the link below to register.<br/><br/> <a href=http://localhost:3001/#/setPassword/${req.body.email} id=get> Register now </a><br/><br/>In case of any issues or questions, feel free to contact us at info@gogiro.com.<br/><br/><text style=\"color:red;\">***Important: Please do not reply to this email.  This mailbox is not set up to receive email.</text><br/><br/><br/>Kind regards,<br/><br/> <text style=\"color:gray;\">GoGiro</text><br/>
							`
						})
					return res.status(200).send(createdBP);
				
			})
		);

		this.router.post(
			'/register',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
		
				const createdUser: User = await this.userManager.register(
					deserialize(User, req.body));


					return res.status(200).send(createdUser);
			
			})
		);

		this.router.post(
			'/login',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try{
				const login: LoginPayload = deserialize(LoginPayload, req.body);
				validateOrThrow(login);
				let user: User = await this.userManager.getUserByEmail(login.email);
				/** START OF SECURITY CHECKS  */
				//performBasicChecks(user);
				/** END OF SECURITY CHECKS  */
				if (!user)
					return res.throwErr(new CustomError(404, 'User not ADMIN'));

				else {
					const loggedUserData: {
						userData: User;
						userJwt: string;
					} = await this.userManager.login(login);
					res.append('accessToken', loggedUserData.userJwt);
					return res.status(200).send({userJwt : loggedUserData.userJwt});
					
				}
			}catch(err){
				return res.status(412).send(err);
			}
			})
		
		);

		this.router.get(
			'/getRole',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var user: User = await this.userManager.getUser(req.userId);
				var role : string = user.role
				return res.status(200).send(role);
			})
		);

	}

}