import { IRequest, IResponse } from '../classes/interfaces';
import {
	parseJwt,
	withErrorHandler
} from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { User, UserRoles, UserStatus } from '../models/user/user';
import { UserManager } from '../manager/userManager';
import { deserialize, serialize } from '../json';
import { POIManager } from '../manager/poiManager';
import { TourManager } from '../manager/tourManager';
import { Tour } from '../models/tours/tour';
import { ToursReport } from '../classes/tour/toursReport';
import { ToursWithPoints } from '../classes/tour/toursWithPoints';
import { Category, POI } from '../models/tours/poiModel';
import { PreviousTourReport } from '../classes/tour/previousReportTour';
import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { simpleAsync } from './util';
import * as multer from 'multer';
import * as fs from 'fs';
import 'es6-shim';
import * as AWS from 'aws-sdk';
import { ConnectionIsNotSetError } from 'typeorm';
import { TourData } from '../classes/tour/tourData';
import { PointData } from '../classes/tour/pointData';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
var multerS3 = require('multer-s3');
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "smrq0Ly8nNjP/WXnd2NSnvHCxUmW5zgeIYuMbTab"
})
var rString: string;
interface IBkRequest extends IRequest {
	tour: Tour;
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


export class TourRouter extends BaseRouter {
	tourManager: TourManager;
	poiManager: POIManager;
	userManager: UserManager;
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
		acl: 'public-read',
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
		this.tourManager = new TourManager();
		this.poiManager = new POIManager();
		this.userManager = new UserManager();
		this.upload = multer({
			storage: this.multerS3Config,
			fileFilter: this.fileFilter,



		});
		this.init();
	}

	init(): void {


		/** GET generate qr code for tour */
		this.router.get(
			'/qr/:tourId',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					const tour: Tour = await this.tourManager.getTour(req.params.tourId);
					if (tour != null) {
						await this.tourManager.generateQr(req.params.tourId);
						return res.status(200).send("Success");
					} else {
						return res.status(412).send("Tour doesn't exist");
					}
				} catch (err) {
					console.log(err.error)
				}


				return res.status(200).send("Success");

			})
		);



		/** GET fetches tour list for admin panel */
		this.router.get(
			'/all',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const tours: Tour[] = await this.tourManager.getTours();
				return res.status(200).send(tours);

			})
		);

		this.router.get(
			'/allToursWithPoints',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {


				const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints();

				return res.status(200).send(tours);

			})
		);


		this.router.get(
			'/previousReport/:tourId',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				if (req.params.tourId == null) {
					res.status(200)
				} else {
					const filter: any = {};
					const data: PreviousTourReport[] = await this.tourManager.getPreviousReportForTour(req.params.tourId, filter);
					return res.status(200).send(data);
				}
			})
		);
		/** GET languages */
		this.router.get(
			'/languages',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const languages: string[] = ["English", "Slovenian", "Serbian", "Spanish"];
				return res.status(200).send(languages);
			})
		);

		/** DELETE tour */
		this.router.get(
			'/deleteTour/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					await this.tourManager.deleteTour(req.params.tourId);

					return res.status(200).send("Success");
				} catch (e) {

					return res.status(500).send("Error");
				}
			})
		);

		/** DELETE poi from tour*/
		this.router.get(
			'/deletePoi/:tourId/:poiId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					await this.tourManager.deletePoi(req.params.tourId, req.params.poiId);

					return res.status(200).send("Success");
				} catch (e) {

					return res.status(500).send("Error");
				}
			})
		);
		/** POST fetches tour data */
		this.router.post(
			'/:tourId/:language',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				//TODO
				const tour: TourData = await this.tourManager.getSingleTour(req.params.tourId, "", "", req.params.language);
				return res.status(200).send(tour);
			})
		);

		/** POST fetches points data for a tour */
		this.router.post(
			'/points/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const tour: PointData[] = await this.tourManager.getTourPoints(req.params.tourId, req.body.language, req.body.bookingId);
				return res.status(200).send(tour);
			})
		);

		/** GET terms and conditions for a tour */
		this.router.get(
			'/termsandconditions/:id',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				var termsAndConditions = await this.tourManager.getTermsAndConditions(req.params.id);
				return res.status(200).send(termsAndConditions);
			})
		);

		/** PATCH patch tour from ADMIN user */
		this.router.post(
			'/update/tour',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,

			this.upload.array('file'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {


					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;


					console.log(tour)
					for (var file of req.files) {
						if (file.originalname.substring(0, 5).trim() === 'image') {

							await this.tourManager.uploadMenu(tour.id, file);

						} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

							await this.tourManager.uploadAudio(tour.id, file);

						}
					}

					await this.tourManager.updateTour(
						tour.id,
						tour
					);

					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints();
					return res.status(200).send(tours);

				} catch (err) {
					console.log(err.error)
				}
			})
		);

		this.router.post(
			'/addFull/add',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,
			this.upload.array('file'),
			//this.upload.single('audio'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {

					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;


					var arr: string[] = []
					var arr2 = []
					if (tour.points.length != 0) {
						for (var point of tour.points) {



							const poi: POI = await this.poiManager.createPOI(deserialize(POI, point));

							//poi.category = Category.NATURE

							arr.push(poi.id)
							arr2.push(poi)
						}

						var partnerImages = []
						for (var f of req.files) {

							if (f.originalname.substring(0, 7).trim() === 'partner') {

								var help = f.originalname.split('---')

								var help2 = help[0].substring(7)
								console.log(help2)

								var h = {
									name: help2,
									path: f.location
								}
								partnerImages.push(h)
							}
						}
						//if the names are the same
						var arrayy = []
						for (var i of arr2) {
							for (var im of partnerImages) {

								if (im.name == i.num) {

									//var fileName = "https://hopguides.s3.eu-central-1.amazonaws.com/" + globalThis.rString;
									arrayy.push(im.path);

								}
							}
							await this.poiManager.uploadImages(i.id, arrayy);
							arrayy = []
						}


						for (var i of arr2) {
							for (var f of req.files) {

								if (f.originalname.substring(0, 6).trim() === 'audio2') {

									var help = f.originalname.split('---')

									var help2 = help[0].substring(6)

									if (help2 == i.num) {
										await this.poiManager.uploadAudio(i.id, f.location);
									}
								}
							}
						}
					}


					arr = arr.reverse()

					var t = {
						title: tour.title,
						shortInfo: tour.shortInfo,
						longInfo: tour.longInfo,
						price: tour.price,
						currency: tour.currency,
						duration: tour.duration,
						length: tour.length,
						highestPoint: tour.highestPoint,
						termsAndConditions: tour.termsAndConditions,
						agreementTitle: tour.agreementTitle,
						agreementDesc: tour.agreementDesc,
						bpartnerId: tour.bpartnerId,
						points: arr
					}
					const createdTour: Tour = await this.tourManager.createTour(
						deserialize(Tour, t)
					);



					for (var file of req.files) {
						if (file.originalname.substring(0, 5).trim() === 'image') {

							await this.tourManager.uploadMenu(createdTour.id, file);

						} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

							await this.tourManager.uploadAudio(createdTour.id, file);

						}
					}

					return res.status(200).send("Success");

				} catch (err) {
					console.log(err.error)
				}

			})
		);


		this.router.post(
			'/addFull/partner',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,
			this.upload.array('file'),
			//this.upload.single('audio'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {

					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;

					console.log(tour)

					var arr: string[] = []
					var arr2 = []
					if (tour.points.length != 0) {
						for (var point of tour.points) {



							const poi: POI = await this.poiManager.createPOI(deserialize(POI, point));

							//poi.category = Category.NATURE

							arr.push(poi.id)
							arr2.push(poi)
						}

						var partnerImages = []
						for (var f of req.files) {

							if (f.originalname.substring(0, 7).trim() === 'partner') {

								var help = f.originalname.split('---')

								var help2 = help[0].substring(7)

								var h = {
									name: help2,
									path: f.location
								}
								partnerImages.push(h)
							}
						}
						//if the names are the same
						var arrayy = []
						for (var i of arr2) {
							for (var im of partnerImages) {

								if (im.name == i.num) {

									//var fileName = "https://hopguides.s3.eu-central-1.amazonaws.com/" + globalThis.rString;
									arrayy.push(im.path);

								}
							}

							await this.poiManager.uploadImages(i.id, arrayy);
							arrayy = []
						}


						for (var i of arr2) {
							for (var f of req.files) {

								if (f.originalname.substring(0, 6).trim() === 'audio2') {

									var help = f.originalname.split('---')

									var help2 = help[0].substring(6)

									if (help2 == i.num) {
										await this.poiManager.uploadAudio(i.id, f.location);
									}
								}
							}
						}
					}
					var t: Tour = await this.tourManager.getTour(
						tour.id,
					);

					var pois = t.points
					for (var p of arr) {
						pois.push(p)
					}
					t.points = pois

					console.log(t)

					await this.tourManager.updateTour(
						t.id,
						deserialize(Tour, t)
					);

					return res.status(200).send("Success");

				} catch (err) {
					console.log(err.error)
				}

			})
		);
	}
}