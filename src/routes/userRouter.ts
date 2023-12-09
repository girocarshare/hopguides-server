
import { User, UserStatus } from '../models/user/user';
import { CustomError } from '../classes/customError';
import { IRequest, IResponse } from '../classes/interfaces';
import { LoginPayload, VerifyPayload } from '../classes/user/loginPayload';
import { deserialize } from '../json';
import { UserManager } from '../manager/userManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import { simpleAsync } from './util';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';

const axios = require('axios');
import {
	parseJwt,
	withErrorHandler
} from '../utils/utils';
import { validateOrThrow } from '../validations';
import { BaseRouter } from './baseRouter';
import { BPartner } from '../models/bpartner/bpartner';
import { RegisterPayload } from '../classes/user/registerPayload';
var multerS3 = require('multer-s3');
var emailSender = "luna.zivkovic@gogiro.app";
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})

const client = require('@sendgrid/client');
client.setApiKey("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");

import sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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")
//var sgMail = require('@sendgrid/mail')('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');



interface IBkRequest extends IRequest {
	request: RegisterPayload;
}

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
		if (file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3|PNG)$/)) {
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
			globalThis.rString = randomstring(10) + "." + list[list.length - 1]
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

		/* POST Create new user */
		this.router.post(
			'/addUser',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				console.log(req.body)
				try {

					var user = await this.userManager.getUserByEmail(req.body.email)
					if(user!=null){
						return res.status(412).send("User already exists");
					}
					const createdUser: User = await this.userManager.addUser(
						deserialize(User, req.body));



					const data = {
						"contacts": [
							{
								"email": req.body.email,

							}
						]
					};

					const requ = {
						url: `/v3/marketing/contacts`,
						method: 'PUT',
						body: data
					}

					client.request(requ)
						.then(([response, body]) => {
							console.log(response.statusCode);
							console.log(response.body);
						})
						.catch(error => {
							console.error(error);
						});



					var val = `<html lang=\\"en\\"><head><meta charset=\\"UTF-8\\"><meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\"><title>Hopguides Email Template</title></head><body><div style=\\"font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: 0 auto;\\"><img src=\\"https://hopguides.s3.eu-central-1.amazonaws.com/video-images/character_descriptions/Screenshot_2023-04-26_at_18.31.44-removebg-preview.png\\" alt=\\"Hopguides Logo\\" style=\\"display: block; margin: 20px auto; width: 100px; text-align: center;\\"><h2>Welcome to Hopguides,</h2><p>Hello, We are excited to have you on board. Your account has been successfully created.</p><p>Please verify your email address by clicking the following link:</p><a href=\\"https://hopguides-video-creation.netlify.app/#/verified/${req.body.email}\\" style=\\"display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 4px;\\">Confirm my account</a><p>Thanks for being an early adapter of synthetic media technology.</p><p>Warm regards,</p><p>Team Hopguides</p><p style=\\"margin-top: 30px; font-size: 0.9em;\\">If you are having any issues with your account, please don’t hesitate to contact us at <a href=\\"mailto:support@hopguides.com\\" style=\\"color: #007BFF;\\">support@hopguides.com</a></p></div></body></html>`

					const body = `{
							"content": [
								{
								  "type": "text/html", 
								  "value": "${val}"
								  
								}
							  ], 
							"personalizations" : [
							  {
								"to" : [
								  {
									"email" : "${req.body.email}"
								  }
								],
								"subject" : "Verify your email"
							  }
							],
							"from" : {
							  "email" : "${emailSender}"
							}
						  }`
					const request = {
						method: 'POST',
						url: '/v3/mail/send',
						body: body
					};
					client.request(request)

						.then(([response, body]) => {
							console.log(response.statusCode);
							console.log(body);
						})


					return res.status(200).send(createdUser);
				} catch (err) {

					console.log(err)
				}

			})
		);




		/* POST Send registration mail */
		this.router.post(
			'/sendRegistrationEmail',
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

					//TODO
					sgMail.send({
						to: "lunazivkovic@gmail.com", // change so that poi.contact.email gets email
						from: `${emailSender}`,
						subject: "Set password",
						html: `Dear partner,<br/><br/>
							
							You have been invited to join our platform. Kindly click on the link below to register.<br/><br/> <a href=https://hopguides-web-client-main-j7limbsbmq-oc.a.run.app/#/setPassword/${req.body.email} id=get> Register now </a><br/><br/>In case of any issues or questions, feel free to contact us at info@gogiro.com.<br/><br/><text style=\"color:red;\">***Important: Please do not reply to this email.  This mailbox is not set up to receive email.</text><br/><br/><br/>Kind regards,<br/><br/> <text style=\"color:gray;\">GoGiro</text><br/>
							`
					})
					return res.status(200).send("Success");
				}
			})
		);

		/* POST Send mail when password forgotten */
		this.router.post(
			'/forgotPassword',
			withErrorHandler(async (req: IRequest, res: IResponse) => {


				var val = `<html><head></head><body><p>Dear partner,</p><p>Kindly click on the link below to reset your password.</p><a href=\\"https://hopguides-web-client-main-j7limbsbmq-oc.a.run.app/#/setPassword/${req.body.email}\\" id=\\"get\\">Reset password</a><p>In case of any issues or questions, feel free to contact us at info@gogiro.com.</p><p style=\\"color:red;\\">***Important: Please do not reply to this email. This mailbox is not set up to receive email.</p><p>Kind regards,</p><p style=\\"color:gray;\\">Hopguides</p></body></html>`



				const body = `{
					"content": [
						{
						  "type": "text/html", 
						  "value": "${val}"
						  
						}
					  ], 
					"personalizations" : [
					  {
						"to" : [
						  {
							"email" : "${req.body.email}"
						  }
						],
						"subject" : "Reset password"
					  }
					],
					"from" : {
					  "email" : "${emailSender}"
					}
				  }`
				const request = {
					method: 'POST',
					url: '/v3/mail/send',
					body: body
				};
				client.request(request)

					.then(([response, body]) => {
						console.log(response.statusCode);
						console.log(body);
					})


				return res.status(200).send();
			})
		);





		this.router.get(
			'/verify/:email',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var body = {
					email: req.params.email
				}
				const login: VerifyPayload = deserialize(VerifyPayload, body);
				validateOrThrow(login);
				let user: User = await this.userManager.getUserByEmail(req.params.email);

				if (!user)
					return res.throwErr(new CustomError(404, 'User does not exist'));

				else {
					user.status = UserStatus.VERIFIED
					user.paid = false;
					user.didapi = "aGkuaG9wZ3VpZGVzQGdtYWlsLmNvbQ:supMmm1zNFSv9IzbL8iw2"
					await this.userManager.updateUser(user.id, user)

					const loggedUserData: {
						userData: User;
						userJwt: string;
					} = await this.userManager.verify(login);
					res.append('accessToken', loggedUserData.userJwt);
					return res.status(200).send({ userJwt: loggedUserData.userJwt, tokens: user.tokens, paid: user.paid });

				}

			})
		);

		
		async function gettokens(api) {

			return await axios.get("https://api.d-id.com/credits", {
					headers: {
						'Authorization': `Basic ${api}`,
						'Content-Type': 'application/json'
					}
				})
					.then(res => {
						console.log(res.data.remaining)
						console.log(res.data)
						return res.data.remaining
					})
					.catch(err => {
						console.log("error " + err)
					});

		}

		/* GET user role */
		this.router.get(
			'/paid',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var user: User = await this.userManager.getUser(req.userId);
				var paid = user.paid

				var tokens = await gettokens(user.didapi)

				return res.status(200).send({paid: paid, tokens: tokens});
			})
		);



		this.router.get(
			'/login/:email',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var body = {
					email: req.params.email
				}
				const login: VerifyPayload = deserialize(VerifyPayload, body);
				validateOrThrow(login);
				let user: User = await this.userManager.getUserByEmail(req.params.email);

				if (!user){
					console.log("Evo meeeee")
					return res.status(404).send("User does not exist");}
				if (user.status != UserStatus.VERIFIED) {
					return res.status(412).send('User  not verified');
				}
				else {
					const loggedUserData: {
						userData: User;
						userJwt: string;
					} = await this.userManager.verify(login);
					res.append('accessToken', loggedUserData.userJwt);
					return res.status(200).send({ userJwt: loggedUserData.userJwt, tokens: user.tokens, paid: user.paid });

				}

			})
		);


		this.router.get(
			'/googlesignup/:email',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					var us = await this.userManager.getUserByEmail(req.params.email);
					var body= {
						email: req.params.email,
						password: "43-R3h8v5i0rJPfCwXYor5CNPJnkvI"
					}
					if (us != null) {
						const login: LoginPayload = deserialize(LoginPayload,body);

						const loggedUserData: {
							userData: User;
							userJwt: string;
						} = await this.userManager.login(login);
						console.log("loggedUserData")
						console.log(loggedUserData)
						res.append('accessToken', loggedUserData.userJwt);
						return res.status(200).send({ userJwt: loggedUserData.userJwt });
					}

					
					const createdUser: User = await this.userManager.createUser(
						deserialize(User, body));

					var data = {
						userId: createdUser.id
					}

					const login: LoginPayload = deserialize(LoginPayload, body);
					validateOrThrow(login);
					let user: User = await this.userManager.getUserByEmail(login.email);

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
					console.log(err)
					console.log(err.error)
					return res.status(412).send(err);
				}
			})
		);


		/* POST Finish user registration */
		this.router.post(
			'/register',
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const createdUser: User = await this.userManager.register(
					deserialize(User, req.body));


				return res.status(200).send("Success");

			})
		);



		/* POST Login */
		this.router.post(
			'/login',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					
					const login: LoginPayload = deserialize(LoginPayload, req.body);
					validateOrThrow(login);
					let user: User = await this.userManager.getUserByEmail(login.email);
					if (!user)
						return res.status(404).send("User does not exist");
					if (user.status != UserStatus.VERIFIED) {
						return res.status(412).send('User  not verified');
					}

					else {
						const loggedUserData: {
							userData: User;
							userJwt: string;
						} = await this.userManager.login(login);
						res.append('accessToken', loggedUserData.userJwt);
						return res.status(200).send({ userJwt: loggedUserData.userJwt, tokens: user.tokens, paid: user.paid });

					}
				} catch (err) {
					console.log(err.error)
					return res.status(415).send(err);
				}
			})

		);

		/* POST Login */
		this.router.post(
			'/registerandlogin',
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					var us = await this.userManager.getUserByEmail(req.body.email);
					console.log(us)
					if (us != null) {
						const login: LoginPayload = deserialize(LoginPayload, req.body);

						const loggedUserData: {
							userData: User;
							userJwt: string;
						} = await this.userManager.login(login);
						console.log("loggedUserData")
						console.log(loggedUserData)
						res.append('accessToken', loggedUserData.userJwt);
						return res.status(200).send({ userJwt: loggedUserData.userJwt });
					}

					const createdUser: User = await this.userManager.createUser(
						deserialize(User, req.body));

					var data = {
						userId: createdUser.id
					}

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
					const login: LoginPayload = deserialize(LoginPayload, req.body);
					validateOrThrow(login);
					let user: User = await this.userManager.getUserByEmail(login.email);

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
					console.log(err)
					console.log(err.error)
					console.log(err.error.error)
					return res.status(412).send(err);
				}
			})

		);

		/* GET user role */
		this.router.get(
			'/getRole',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var user: User = await this.userManager.getUser(req.userId);
				var role: string = user.role
				return res.status(200).send(role);
			})
		);

		/* GET user role */
		this.router.get(
			'/tokens',
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var user: User = await this.userManager.getUser(req.userId);
				var tokens = user.tokens
				console.log(tokens)
				return res.status(200).send(tokens.toString());
			})
		);

	}

}