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
import {  POI } from '../models/tours/poiModel';
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

async function getTour1() {

	return await axios.get('https://api.mapbox.com/directions/v5/mapbox/cycling/13.988995747188019%2C46.127989267713815%3B13.94738552325419%2C46.10240264529747%3B13.932778084586202%2C46.11074537757715%3B13.917095599398841%2C46.11006788635984%3B13.916685347606682%2C46.11037818068329%3B13.923620109187125%2C46.08979153023348%3B13.942740918361155%2C46.08743708478799%3B13.988995747188019%2C46.127989267713815?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A')
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});

}

async function getTour2() {

	return await axios.get('https://api.mapbox.com/directions/v5/mapbox/cycling/14.028174022432776%2C46.15268184141383%3B14.028103776814007%2C46.15390804560133%3B14.009808626050265%2C46.14513966813935%3B13.989218009254753%2C46.128126292766574%3B14.028174022432776%2C46.15268184141383?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A')
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});
}


async function getTour3() {

	return await axios.get('https://api.mapbox.com/directions/v5/mapbox/cycling/13.989310343597712%2C46.1274612555054%3B14.039045755138545%2C46.150261132300656%3B14.048760256715848%2C46.155052734793536%3B14.061266131351102%2C46.16317568864926%3B14.059071910403091%2C46.16255971130006%3B14.068090092982692%2C46.16671905216502%3B13.989310343597712%2C46.1274612555054?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A')
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});
}

async function getTour4() {

	return await axios.get('https://api.mapbox.com/directions/v5/mapbox/cycling/13.837456879098585%2C46.25122672743737%3B13.840588045483033%2C46.26352054074271?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A')
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});
}

async function getTour5() {

	return await axios.get('https://api.mapbox.com/directions/v5/mapbox/cycling/14.498683481577352%2C46.07316498842294%3B14.4847756774313%2C46.0781352616732?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A')
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});
}

async function getTour6() {

	return await axios.get('https://api.mapbox.com/directions/v5/mapbox/cycling/14.52631430989233%2C46.300752124149376%3B14.52575366181582%2C46.27501392035784%3B14.487019678375963%2C46.25305594698747%3B14.549031296360074%2C46.19495389800865%3B14.607446600532661%2C46.22215141303892%3B14.52631430989233%2C46.300752124149376?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A')
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});
}

async function getTour7() {

	return await axios.get('https://api.mapbox.com/directions/v5/mapbox/cycling/15.594464867474043%2C46.15701450237126%3B15.571758737307192%2C46.166738846290826%3B15.560585685035239%2C46.14692043332319%3B15.56263831951681%2C46.14983665364953%3B15.563893142944742%2C46.15070249558895%3B15.564515198078679%2C46.14444852635371%3B15.594464867474043%2C46.15701450237126?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A')
		.then(res => res.data)
		.catch(error => {
			console.log(error);
		});
}

async function getTour8() {

	return await axios.get('https://api.mapbox.com/directions/v5/mapbox/cycling/14.527071229776212%2C45.958869863428866%3B14.499042884314187%2C45.91128573220706%3B14.480071122810324%2C45.98285652471492%3B14.47939171633004%2C45.98232457665211%3B14.491428791607662%2C45.96942227381013%3B14.535719158455112%2C45.96556621108463%3B14.548536053002215%2C45.94155237302911%3B14.527071229776212%2C45.958869863428866?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoibHVuYXppdmtvdmljIiwiYSI6ImNremJ1N2l3YzBneDEybm50YTk2OWw1Y2gifQ.iDYohamiOMua_de_Y_wZ-A')
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
						var qrCode: QRCodes = await this.tourManager.generateQr(req.params.tourId);
						return res.status(200).send(qrCode);
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

				const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId);

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
					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId);
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

					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId);
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

				var response = ""
				if (req.params.tourId == "d87c2c83-59a3-43ff-849f-58f46375790f") {
				


					
					await getTour1()
						.then(res => 
							response = res.routes[0].geometry.coordinates)

						return res.status(200).send(response);

				} else if (req.params.tourId == "9a7ba670-e1ac-4350-892e-e15a55a145cc") {

					await getTour2()
						.then(res => 
							response = res.routes[0].geometry.coordinates)

						return res.status(200).send(response);
				}else if (req.params.tourId == "3dbc0dea-4cd6-435c-a7bf-bd1fe800d8c7") {

					await getTour3()
						.then(res => 
							response = res.routes[0].geometry.coordinates)

						return res.status(200).send(response);
				}else if (req.params.tourId == "d225fdbc-7734-41bc-9031-d8304b49e090") {

					await getTour4()
						.then(res => 
							response = res.routes[0].geometry.coordinates)

						return res.status(200).send(response);
				}else if (req.params.tourId == "606917af-d0d6-4c11-a7f6-5f7061215ca6") {

					await getTour5()
						.then(res => 
							response = res.routes[0].geometry.coordinates)

						return res.status(200).send(response);
				}else if (req.params.tourId == "d87c2c83-59a3-43ff-849f-58f463757901") {

					await getTour6()
						.then(res => 
							response = res.routes[0].geometry.coordinates)

						return res.status(200).send(response);
				}else if (req.params.tourId == "b4e4de00-925d-4f82-b19d-a2d207d67634") {

					await getTour7()
						.then(res => 
							response = res.routes[0].geometry.coordinates)

						return res.status(200).send(response);
				}else if (req.params.tourId == "3e212d06-8c1a-4732-a4a7-be026f70ca9c") {

					await getTour8()
						.then(res => 
							response = res.routes[0].geometry.coordinates)

						return res.status(200).send(response);
				}


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
			parseJwt,

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

					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId);
					return res.status(200).send(tours);

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

					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId);
					return res.status(200).send(tours);

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

					const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints(req.userId);
					return res.status(200).send(tours);

				} catch (err) {
					console.log(err.error)
				}

			})
		);
	}
}