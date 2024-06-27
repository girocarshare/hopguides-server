
import { IRequest, IResponse } from '../classes/interfaces';
import { Obj, POIManager } from '../manager/poiManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import { BaseRouter } from './baseRouter';
import { UserManager } from '../manager/userManager';
import {
	parseJwt,
	withErrorHandler
} from '../utils/utils';
import { POI } from '../models/tours/poiModel';
import { BPartner } from '../models/bpartner/bpartner';
import { deserialize, serialize } from '../json';
import { CustomError } from '../classes/customError';
import * as multer from 'multer';
import * as fs from 'fs';
import { simpleAsync } from './util';
import { ToursReport } from '../classes/tour/toursReport';
import { TourManager } from '../manager/tourManager';

import * as sgMail from '@sendgrid/mail';
import { ToursWithPoints } from '../classes/tour/toursWithPoints';

import * as AWS from 'aws-sdk';
import { LocalizedField } from '../models/localizedField';
import { Tour } from '../models/tours/tour';
var multerS3 = require('multer-s3');
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})

export class HelpObj {
	number: string
	name: LocalizedField
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

interface IBkRequest extends IRequest {
	point: POI;
	pointId: string;
}


sgMail.setApiKey("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")
var emailSender = "luna.zivkovic@gogiro.app";
export class POIRouter extends BaseRouter {
	poiManager: POIManager;
	bpartnerManager: BPartnerManager;
	tourManager: TourManager;
	userManager: UserManager;

	fileFilter = (req, file, cb) => {
		if (file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3|mp4|PNG)$/)) {
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
			globalThis.rString = randomstring(10) + "." + list[list.length - 1]
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
		this.userManager = new UserManager();
		this.upload = multer({
			storage: this.multerS3Config,
			fileFilter: this.fileFilter,

		});
		this.init();
	}

	init(): void {

		/** GET all poi */
		this.router.get(
			'/all',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					return res.status(412).send(await this.poiManager.getPois());
				} catch (err) {
					return res.status(412).send("Error while getting pois");
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


				return await this.poiManager.uploadMenu(req.params.pointId, req.file.location);
			})
		);


		this.router.post(
			'/update',
			parseJwt,
			this.upload.array('file'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				try {
					let jsonObj = JSON.parse(req.body.point);
					let point = jsonObj as POI;
					let arrayy = [];

					let tour: Tour | null = null;
					let tours: Tour[] = await this.tourManager.getTours();

					for (let t of tours) {
						for (let poi of t.points) {
							if (point.id === poi) {  // Assuming poi is an object, compare IDs
								tour = t;
								break;
							}
						}
						if (tour) break;
					}

					if (!tour) {
						console.log('Tour not found for the given POI');
						return res.status(404).send('Tour not found');
					}

					let user = await this.userManager.getUser(req.userId);
					let poiPrevious = await this.poiManager.getPoiByPreviousId(point.id);

					if (poiPrevious != null) {
						if (user.role === "ADMIN") {
							return res.status(412).send("Poi already updated by partner");
						}

						for (let f of req.files) {
							if (f.originalname.trim().startsWith('audio2')) {
								await this.poiManager.uploadAudio(point.id, f.location, point.language);
							} else if (f.originalname.trim().startsWith('partner')) {
								arrayy.push(f.location);
							}
						}

						let obj: Obj = new Obj();
						obj.paths = arrayy;
						await this.poiManager.uploadImages(poiPrevious.id, obj, point.language);

						if (poiPrevious.images.length != 0) {
							await this.poiManager.updatePoi(poiPrevious.id, point);
						}

						sgMail.send({
							to: "luna.zivkovic@gogiro.app",
							from: emailSender,
							subject: "Point of interest updated",
							html: `Dear,<br/><br/> Point of interest with id: ${poiPrevious.id} and name ${poiPrevious.name.english} has been updated by partner with id ${req.userId}. Please approve or disapprove the changes. <br/><br/> <br/>`
						});
					} else {
						if (user.role === "PROVIDER") {
							let poi = await this.poiManager.getPoi(point.id);
							poi.previousId = poi.id;
							let poiUpdated = await this.poiManager.createPOI(deserialize(POI, poi));

							if (point.images.length === 0) {
								await this.poiManager.updatePoi(poiUpdated.id, point);
							}

							for (let f of req.files) {
								if (f.originalname.trim().startsWith('audio2')) {
									await this.poiManager.uploadAudio(point.id, f.location, point.language);
								} else if (f.originalname.trim().startsWith('menu')) {
									await this.poiManager.uploadMenu(point.id, f.location);
								} else if (f.originalname.trim().startsWith('partner')) {
									arrayy.push(f.location);
								}
							}

							let obj: Obj = new Obj();
							obj.paths = arrayy;
							await this.poiManager.uploadImages(poiUpdated.id, obj, point.language);

							if (point.images.length != 0) {
								await this.poiManager.updatePoi(poiUpdated.id, point);
							}

							let points = tour.points.filter(p => p !== point.id);
							points.push(poiUpdated.id);
							tour.points = points;
							tour.previousId = tour.id;
							tour.update = true;

							let t = await this.tourManager.createTour(deserialize(Tour, tour));
							await this.tourManager.updateTour(tour.id, tour);

							sgMail.send({
								to: "luna.zivkovic@gogiro.app",
								from: emailSender,
								subject: "Point of interest updated",
								html: `Dear,<br/><br/> Point of interest with id: ${poi.id} and name ${poi.name.english} has been updated by partner with id ${req.userId}. Please approve or disapprove the changes. <br/><br/> <br/>`
							});

							return res.status(200).send([]);
						} else if (user.role === "ADMIN") {
							await this.poiManager.updatePoi(point.id, point);

							for (let f of req.files) {
								if (f.originalname.trim().startsWith('audio2')) {
									await this.poiManager.uploadAudio(point.id, f.location, point.language);
								} else if (f.originalname.trim().startsWith('menu')) {
									await this.poiManager.uploadMenu(point.id, f.location);
								} else if (f.originalname.trim().startsWith('partner')) {
									arrayy.push(f.location);
								}
							}

							if (arrayy.length != 0) {
								let obj: Obj = new Obj();
								obj.paths = arrayy;
								await this.poiManager.uploadImages(point.id, obj, point.language);
							}

							let updatedTour = await this.tourManager.getTourData(tour.id);
							return res.status(200).send({ updatedTour: updatedTour });
						}
					}
				} catch (err) {
					console.error('Error updating POI:', err);
					res.status(500).send('Internal server error');
				}
			})
		);
	}
	}