import { IRequest, IResponse } from '../classes/interfaces';
import { UserManager } from '../manager/userManager';
import { parseJwt, withErrorHandler } from '../utils/utils';
import { User, UserRoles, UserStatus } from '../models/user/user';
import { BaseRouter } from './baseRouter';
import { deserialize, serialize } from '../json';
import { validateOrThrow } from '../validations';
import { BPartnerManager } from '../manager/bpartnerManager';
import { CreateBPartnerPayload } from '../classes/bpartner/createBPartner';
import { BPartner } from '../models/bpartner/bpartner';
import { CustomError } from '../classes/customError';
import { Contact } from '../classes/bpartner/contact';
import * as multer from 'multer';

import * as AWS from 'aws-sdk';
import { simpleAsync } from './util';
import { Dimensions } from '../classes/user/registerPayload';
var multerS3 = require('multer-s3');
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})
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
interface IBkRequest extends IRequest {
	bpartner: BPartner;
	bpartnerId: string;
}
interface IBkRequestDim extends IRequest {
	dimensions: Dimensions;
}

export class BPartnerRouter extends BaseRouter {
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
		bucket: 'hopguides/menu',
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
	constructor() {
		super(true);
		this.userManager = new UserManager();
		this.bpartnerManager = new BPartnerManager();
		this.init();

		
	}

	init(): void {

		/** GET all bpartners   */
		this.router.get(
			'/all',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const filter: any = {};

				const bpartners: BPartner[] = await this.bpartnerManager.getBPartners(filter);

				var arr = []
				for (var bpartner of bpartners) {
					var bp = {
						id: bpartner.id,
						name: bpartner.name
					}
					arr.push(bp)
				}

				return res.status(200).send(arr);
			})
		);

		/** GET all bpartners   */
		this.router.get(
			'/allwithdata',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const filter: any = {};

				const bpartners: BPartner[] = await this.bpartnerManager.getBPartners(filter);

				

				return res.status(200).send(bpartners);
			})
		);

		/** GET support data */
		this.router.post(
			'/support/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const contact: Contact = await this.bpartnerManager.getContact(req.params.tourId, req.body.language);
				return res.status(200).send(contact);
			})
		);

		this.router.post(
			'/updateLogo',
			//userSecurity(),
			//ownedBookingInStatusMdw(RentStatus.DRIVING),
			parseJwt,
			this.upload.single('file'),
			simpleAsync(async (req: IBkRequestDim, res: IResponse) => {

					let jsonObj = JSON.parse(req.body.dimensions);
					let dimensions = jsonObj as Dimensions;

					console.log(req.userId)
				var user: User = await this.userManager.getUser(req.userId.trim());
				
				if (!req.file) {
					return res.status(500).send("Error")
				}

				return await this.bpartnerManager.uploadLogoWithDim(req.userId, req.file.location, dimensions);
			})
		);

		this.router.post(
			'/changeLockCode/:code',
			//userSecurity(),
			//ownedBookingInStatusMdw(RentStatus.DRIVING),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				// Upload
				try{
				var user: User = await this.userManager.getUser(req.userId);
				await this.bpartnerManager.updateLockCode(req.userId,req.params.code );
				return res.status(200).send("Success")
				}
				catch(e){
					return res.status(412).send("Error while changing lock code")
				}
			})
		);


		/** POST update poi */
		this.router.post(
			'/update',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,

			this.upload.array('file'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				try {

					let jsonObj = JSON.parse(req.body.bpartner);
					let bpartner = jsonObj as BPartner;

					var arrayy = []
					const updatedBpartner: BPartner = await this.bpartnerManager.updateBPartner(
						bpartner.id,
						bpartner
					);

					for (var f of req.files) {

					
							await this.bpartnerManager.uploadLogo(bpartner.id, f.location);

					}
					return res.status(200).send("Success");
				} catch (err) {
					console.log(err.errors)
				}
			})
		);


		/** DELETE business partner */
		this.router.get(
			'/delete/:bpartnerId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					await this.bpartnerManager.deleteBPartner(req.params.bpartnerId);

					const bpartners: BPartner[] = await this.bpartnerManager.getBPartners({});
				return res.status(200).send(bpartners);
				} catch (e) {

					return res.status(500).send("Error");
				}
			})
		);


	}
}
