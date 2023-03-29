
import { User, UserRoles, UserStatus } from '../models/user/user';
import { CustomError } from '../classes/customError';
import { IRequest, IResponse, MulterFile } from '../classes/interfaces';
import { LoginPayload } from '../classes/user/loginPayload';
import { deserialize, serialize } from '../json';
import { UserManager } from '../manager/userManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import { simpleAsync } from './util';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import {
	parseJwt,
	withErrorHandler
} from '../utils/utils';
import { validateOrThrow } from '../validations';
import { BaseRouter } from './baseRouter';
import { BPartner } from '../models/bpartner/bpartner';
import * as sgMail from '@sendgrid/mail';
import { RegisterPayload } from '../classes/user/registerPayload';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
var multerS3 = require('multer-s3');
sgMail.setApiKey("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")
var emailSender = "beta-app@gogiro.app";
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})
interface IBkRequest extends IRequest {
	request: RegisterPayload;
}
var rString: string;

function randomstring(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	return result;
}

export class UserRouter extends BaseRouter {
	userManager: UserManager;
	bpartnerManager: BPartnerManager;
	


	fileFilter = (req, file, cb) => {
		if (file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3)$/)) {
			cb(null, true)
		} else {
			cb(null, false)
		}
	}


	multerS3Config = multerS3({
		s3: s3,
		bucket: 'hopguides/logos',
		metadata: function (req, file, cb) {

			cb(null, { fieldName: globalThis.rString });
		},
		key: function (req, file, cb) {
			var list = file.originalname.split('.')
			globalThis.rString = randomstring(10)+ "." + list[list.length - 1]
			cb(null, globalThis.rString)
		}
	});

	upload = multer({
		storage: this.multerS3Config,
		fileFilter: this.fileFilter,



	})


	getFields = multer();
	constructor() {
		super();
		this.userManager = new UserManager();
		this.bpartnerManager = new BPartnerManager();
		this.upload = multer({
			storage: this.multerS3Config,
			fileFilter: this.fileFilter,

		});

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
			//this.getFields.any(),
			this.upload.single('file'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {

				{


				let jsonObj = JSON.parse(req.body.request);
				let data = jsonObj as RegisterPayload;
				
				const createdUser: User = await this.userManager.sendRegistrationEmail(
					deserialize(User, req.body));

			
				data.userId = createdUser.id

				const bpartnerData: BPartner = deserialize(
					BPartner,
					data
				);
				const createdBP: BPartner = await this.bpartnerManager.createBP(
					createdUser,
					bpartnerData
				);

				var fileName = "https://hopguides.s3.eu-central-1.amazonaws.com/logos/" + globalThis.rString;
				await this.bpartnerManager.uploadLogo(createdBP.id, fileName);
				sgMail.send({
					to: "lunazivkovic@gmail.com", // change so that poi.contact.email gets email
					from: `${emailSender}`,
					subject: "Set password",
					html: `Dear partner,<br/><br/>
							
							You have been invited to join our platform. Kindly click on the link below to register.<br/><br/> <a href=http://localhost:3001/#/setPassword/${req.body.email} id=get> Register now </a><br/><br/>In case of any issues or questions, feel free to contact us at info@gogiro.com.<br/><br/><text style=\"color:red;\">***Important: Please do not reply to this email.  This mailbox is not set up to receive email.</text><br/><br/><br/>Kind regards,<br/><br/> <text style=\"color:gray;\">GoGiro</text><br/>
							`
				})
					return res.status(200).send("Success");
				}
			})
		);


		this.router.post(
			'/forgotPassword',
			withErrorHandler(async (req: IRequest, res: IResponse) => {


				sgMail.send({
					to: "lunazivkovic@gmail.com", // change so that poi.contact.email gets email
					from: `${emailSender}`,
					subject: "Reset password",
					html: `Dear partner,<br/><br/>
							
							Kindly click on the link below to reset your password.<br/><br/> <a href=http://localhost:3001/#/setPassword/${req.body.email} id=get> Reset password </a><br/><br/>In case of any issues or questions, feel free to contact us at info@gogiro.com.<br/><br/><text style=\"color:red;\">***Important: Please do not reply to this email.  This mailbox is not set up to receive email.</text><br/><br/><br/>Kind regards,<br/><br/> <text style=\"color:gray;\">GoGiro</text><br/>
							`
				})
				return res.status(200).send();
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
				try {
					const login: LoginPayload = deserialize(LoginPayload, req.body);
					validateOrThrow(login);
					let user: User = await this.userManager.getUserByEmail(login.email);
					/** START OF SECURITY CHECKS  */
					//performBasicChecks(user);
					/** END OF SECURITY CHECKS  */
					if (!user)
						return res.throwErr(new CustomError(404, 'User does not exist'));

					else {
						const loggedUserData: {
							userData: User;
							userJwt: string;
						} = await this.userManager.login(login);
						res.append('accessToken', loggedUserData.userJwt);
						return res.status(200).send({ userJwt: loggedUserData.userJwt });

					}
				} catch (err) {
					return res.status(412).send(err);
				}
			})

		);

		this.router.get(
			'/getRole',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var user: User = await this.userManager.getUser(req.userId);
				var role: string = user.role
				return res.status(200).send(role);
			})
		);

	}

}