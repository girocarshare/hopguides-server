import { IRequest, IResponse } from '../classes/interfaces';
import {
	parseJwt,
	withErrorHandler
} from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { UserManager } from '../manager/userManager';
import { deserialize } from '../json';
import { Obj, POIManager } from '../manager/poiManager';
import { TourManager } from '../manager/tourManager';
import { Tour } from '../models/tours/tour';
import { ToursWithPoints } from '../classes/tour/toursWithPoints';
import { POI } from '../models/tours/poiModel';
import { PreviousTourReport } from '../classes/tour/previousReportTour';
import 'reflect-metadata';
import { simpleAsync } from './util';
import * as multer from 'multer';
const axios = require('axios');
import 'es6-shim';
import * as AWS from 'aws-sdk';
import { TourData } from '../classes/tour/tourData';
import { PointData } from '../classes/tour/pointData';
import { QRCodes } from '../models/qrcodes/qrcodes';
var multerS3 = require('multer-s3');
const { Configuration, OpenAIApi } = require("openai");
var gpxParser = require('gpxparser');
var gpxParse = require("gpx-parse");

var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})
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

const configuration = new Configuration({
	apiKey: "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",
});
const openai = new OpenAIApi(configuration);


async function getTour(string) {

	return await axios.get(string)
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});

}

export class TourRouter extends BaseRouter {
	tourManager: TourManager;
	poiManager: POIManager;
	userManager: UserManager;
	fileFilter = (req, file, cb) => {
		if (file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3|mp4)$/)) {
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
		this.router.post(
			'/chat/openAI',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const { prompt } = req.body;

				// Generate a response with ChatGPT
				const completion = await openai.createCompletion({
					model: "text-davinci-002",
					prompt: prompt,
					max_tokens: 2500,
					n: 1
				});
				res.send(completion.data.choices[0].text);
			})
		);


		/** GET generate qr code for tour */
		this.router.get(
			'/qr/:tourId/:number',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					const tour: Tour = await this.tourManager.getTour(req.params.tourId);
					if (tour != null) {
						var qrCodes: QRCodes[] = await this.tourManager.generateQr(req.params.tourId, Number.parseInt(req.params.number));
						return res.status(200).send(qrCodes);
					} else {
						return res.status(412).send("Tour doesn't exist");
					}
				} catch (err) {
					return res.status(412).send("Qr code for this tour is already generated.");
				}


			})
		);

		/** GET already generated qr code for tour */
		this.router.get(
			'/getqrcodes/:tourId',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					const tour: Tour = await this.tourManager.getTour(req.params.tourId);
					if (tour != null) {
						var qr = await this.tourManager.getQRForTour(req.params.tourId);
						return res.status(200).send(qr);
					} else {
						return res.status(412).send("Tour doesn't exist");
					}
				} catch (err) {
					return res.status(412).send("Qr codes for this tour doesn't exist.");
				}


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
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);

				return res.status(200).send(tours);

			})
		);

		this.router.get(
			'/allUpdatedToursWithPoints',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, true);

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
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					await this.tourManager.deleteTour(req.params.tourId);
					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);
					return res.status(200).send(tours);
				} catch (e) {

					return res.status(500).send("Error");
				}
			})
		);

		/** DELETE poi from tour*/
		this.router.get(
			'/deletePoi/:tourId/:poiId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					await this.tourManager.deletePoi(req.params.tourId, req.params.poiId);

					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);
					return res.status(200).send(tours);
				} catch (e) {

					return res.status(500).send("Error");
				}
			})
		);
		/** POST fetches tour data */
		this.router.post(
			'/:qrCodeId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				//TODO
				const tour: TourData = await this.tourManager.getSingleTour(req.params.qrCodeId, "", "", req.body.language);
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



		/** POST fetches points data for a tour */
		this.router.get(
			'/geojson/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {
					var response = ""
					console.log(req.params.tourId)
					var tour1 = await this.tourManager.getTour(req.params.tourId)
					if (tour1 != null) {
						if (tour1.gpx != null) {
							console.log(tour1.gpx)

							return res.status(200).send(tour1.gpx);
						} else {
							var tour = await this.tourManager.getToursWithPointsForMapbox(req.params.tourId)

							var url = "https://api.mapbox.com/directions/v5/mapbox/cycling/"

							for (var poi of tour.points) {
								url += poi.point.location.latitude + "%2C" + poi.point.location.longitude + "%3B"
							}

							url = url.substring(0, url.length - 3);
							url += "?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A"
							await getTour(url)
								.then(res =>
									response = res.routes[0].geometry.coordinates)

									var str = "["
					for (var objec of response) {
						str += "[" + objec + "],"

					}
					str += "]"
							return res.status(200).send(str);

						}
					}
				} catch (e) {
					console.log(e.error.errors)
				}



			})
		);

		function getSubstring(string: string, char1: string, char2: string) {
			return string.slice(
				string.indexOf(char1) + 1,
				string.lastIndexOf(char2),
			);
		}


		/** POST fetches points data for a tour */
		this.router.post(
			'/parse/gpx',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				var response = []
				var gpx = new gpxParser(); //Create gpxParser Object
				gpx.parse(req.body.text); //parse gpx file from string data

				for (var item of gpx.tracks[0].points) {
					var obj = []
					obj.push(item.lon)
					obj.push(item.lat)
					response.push(obj)
				}

				var tour = await this.tourManager.getTour(req.body.id)
				if (tour != null) {

					var str = "["
					for (var objec of response) {
						str += "[" + objec + "],"

					}
					str += "]"
					tour.gpx = str;
					await this.tourManager.updateTour(
						tour.id,
						tour
					);
				} else {
					return res.status(412).send("Tour doesnt exist");
				}

				return res.status(200).send(response);


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

		/**  */
		this.router.get(
			'/approve/:tourid',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {
					var tour = await this.tourManager.getTour(req.params.tourid)
					tour.update = false;
					await this.tourManager.updateTour(
						tour.id,
						tour
					);

					await this.tourManager.deleteUpdatedTour(
						tour.previousId
					);
					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, true);
					return res.status(200).send(tours);
				} catch (err) {
					console.log(err.error)
				}
			})
		);


		/**  */
		this.router.get(
			'/disapprove/:tourid',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {
					await this.tourManager.deleteUpdatedTour(
						req.params.tourid
					);
					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, true);
					return res.status(200).send(tours);
				} catch (err) {
					console.log(err)
				}
			})
		);

		/** PATCH patch tour from ADMIN user */
		this.router.post(
			'/update/tour',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			parseJwt,
			this.upload.array('file'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {

					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;

					var user = await this.userManager.getUser(req.userId)

					var tourprev = await this.tourManager.getTourByPreviousId(tour.id)
					var touroriginal = await this.tourManager.getTour(tour.id)

					if (tourprev != null) {
						if (user.role == "ADMIN") {
							return res.status(412).send("Tour already updated by partner");
						}
						for (var file of req.files) {
							if (file.originalname.substring(0, 5).trim() === 'image') {

								await this.tourManager.uploadMenu(tour.id, file);

							} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

								await this.tourManager.uploadAudio(tour.id, file);

							}
						}
						tourprev.update = false;
						await this.tourManager.updateTour(
							tourprev.id,
							tour
						);

					} else {
						if (user.role == "PROVIDER") {
							for (var file of req.files) {
								if (file.originalname.substring(0, 5).trim() === 'image') {

									await this.tourManager.uploadMenu(tour.id, file);

								} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

									await this.tourManager.uploadAudio(tour.id, file);

								}
							}

							tour.previousId = tour.id
							tour.update = true;
							var t = await this.tourManager.createTour(
								deserialize(Tour, touroriginal)
							);
							await this.tourManager.updateTour(
								t.id,
								tour
							);
						} else if (user.role == "ADMIN") {


							for (var file of req.files) {
								if (file.originalname.substring(0, 5).trim() === 'image') {

									await this.tourManager.uploadMenu(tour.id, file);

								} else if (file.originalname.substring(0, 6).trim() === 'audio1') {

									await this.tourManager.uploadAudio(tour.id, file);

								}
							}
							tour.update = false;
							await this.tourManager.updateTour(
								tour.id,
								tour
							);
						}
						const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);
						return res.status(200).send(tours);
					}

				} catch (err) {
					console.log(err.error)
				}
			})
		);

		this.router.post(
			'/addFull/add',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			parseJwt,
			this.upload.array('file'),
			//this.upload.single('audio'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {

					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;

					tour.update = false;
					var arr: string[] = []
					var arr2 = []
					var imageTitles = []
					if (tour.points.length != 0) {
						for (var point of tour.points) {

							const poi: POI = await this.poiManager.createPOI(deserialize(POI, point));

							var poiJson = deserialize(POI, point)

							var item = {
								images: poiJson.imageTitles,
								num: poiJson.num

							}
							imageTitles.push(item)

							arr.push(poi.id)
							arr2.push(poi)
						}

						var partnerImages = []
						for (var f of req.files) {

							if (f.originalname.substring(1, 8).trim() === 'partner') {

								var help = f.originalname.split('---')

								var help2 = help[0].substring(8)
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


									arrayy.push(im.path);
								}
							}

							var obj: Obj = new Obj();

							for (var title of imageTitles) {
								if (title.num == i.num) {
									obj.names = title.images
								}
							}
							obj.paths = arrayy
							await this.poiManager.uploadImages(i.id, obj);
							arrayy = []
						}

						for (var i of arr2) {
							console.log(i)
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
						update: tour.update,
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

					//const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);
					return res.status(200).send("Success");

				} catch (err) {
					console.log(err.error)
				}

			})
		);


		this.router.post(
			'/addFull/partner',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			parseJwt,
			this.upload.array('file'),
			//this.upload.single('audio'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {

					let jsonObj = JSON.parse(req.body.tour);
					let tour = jsonObj as Tour;

					var arr: string[] = []
					var arr2 = []
					var imageTitles = []
					if (tour.points.length != 0) {
						for (var point of tour.points) {

							const poi: POI = await this.poiManager.createPOI(deserialize(POI, point));

							var poiJson = deserialize(POI, point)

							var item = {
								images: poiJson.imageTitles,
								num: poiJson.num

							}
							imageTitles.push(item)

							arr.push(poi.id)
							arr2.push(poi)
						}

						var partnerImages = []

						for (var f of req.files) {

							if (f.originalname.substring(1, 8).trim() === 'partner') {

								var help = f.originalname.split('---')

								var help2 = help[0].substring(8)
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

									arrayy.push(im.path);

								}
							}

							var obj: Obj = new Obj();

							for (var title of imageTitles) {
								if (title.num == i.num) {
									obj.names = title.images
								}
							}
							obj.paths = arrayy
							await this.poiManager.uploadImages(i.id, obj);
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

					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId, false);
					return res.status(200).send(tours);

				} catch (err) {
					console.log(err.error)
				}

			})
		);
	}
}