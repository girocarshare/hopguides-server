
import { IRequest, IResponse } from '../classes/interfaces';
import { POIManager } from '../manager/poiManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import { withErrorHandler } from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { POI } from '../models/tours/poiModel';
import { BPartner } from '../models/bpartner/bpartner';
import { deserialize, serialize } from '../json';
import { CustomError } from '../classes/customError';
import * as multer from 'multer';
import * as fs from 'fs';
import { simpleAsync } from './util';
import { ToursReport } from '../classes/tour/toursReport';
import { TourManager } from '../manager/tourManager';

import { ToursWithPoints } from '../classes/tour/toursWithPoints';

import * as AWS from 'aws-sdk';
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
	point: POI;
	pointId: string;
}

export class POIRouter extends BaseRouter {
	poiManager: POIManager;
	bpartnerManager: BPartnerManager;
	tourManager: TourManager;

	fileFilter = (req, file, cb) => {
		if (file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3)$/)) {
			cb(null, true)
		} else {
			cb(null, false)
		}
	}


	multerS3Config = multerS3({
		s3: s3,
		bucket: 'hopguides/tours',
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
		this.poiManager = new POIManager();
		this.bpartnerManager = new BPartnerManager();
		this.tourManager = new TourManager();
		this.upload =multer({
			storage: this.multerS3Config,
			fileFilter: this.fileFilter,

		});
		this.init();
	}

	init(): void {

		/** POST reate POI */
		this.router.post(
			'/create',
			//allowFor([AdminRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					const bpartner: BPartner = await this.bpartnerManager.getBP(req.body.bpartnerId);


					if (bpartner == null) {
						throw new CustomError(404, 'BPartner not found');
					}
					const poi: POI = await this.poiManager.createPOI(
						deserialize(POI, req.body)
					);


					return res.status(200).send(poi);
				} catch (err) {
					console.log(err.error)
				}
			})
		);

		this.router.post(
			'/:pointId/uploadMenu',
			//userSecurity(),
			//ownedBookingInStatusMdw(RentStatus.DRIVING),
			this.upload.single('file'),
			simpleAsync(async (req: IBkRequest) => {
				// Upload
				if (!req.file) console.log("Error while uploading file")
				
				var fileName = "https://hopguides.s3.eu-central-1.amazonaws.com/" + globalThis.rString;
				return await this.poiManager.uploadMenu(req.params.pointId, fileName);
			})
		);


		/** GET poi picture   */

		this.router.get(
			'/getFile/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {

					var point: POI = await this.poiManager.getPoi((req.params.id).trim());

					if (point.menu != null) {
						fs.readFile("./" + point.menu, (error, data) => {
							if (error) {
								throw error;
							}
							var file = data

							res.status(200);
							res.setHeader('Content-Type', 'application/octet-stream');
							res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.fileName);
							res.write(file, 'binary');
							res.end();

						});
					} else {
						res.status(200)
					}
				} catch (err) {
					console.log(err.error)
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
				try{
					console.log("TUUU SAMMM")

					let jsonObj = JSON.parse(req.body.point); 
					let point = jsonObj as POI;
					console.log(point)

				/*var point: POI = await this.poiManager.getPoi(req.body.point.id)
				point.price = req.body.point.price
				point.offerName = req.body.point.offerName
				point.contact.name = req.body.point.contact.name
				point.contact.phone = req.body.point.contact.phone
				point.contact.email = req.body.point.contact.email
*/
				const updatedPoi: POI = await this.poiManager.updatePoi(
					point.id,
					point
				);


				const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints();
				
				return res.status(200).send(tours);
				}catch(err){
					console.log(err)
				}
			})
		);
	}
}