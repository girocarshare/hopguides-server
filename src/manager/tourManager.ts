import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { Tour } from '../models/tours/tour';
import { MulterFile } from '../classes/interfaces';
import { ToursReport } from '../classes/tour/toursReport';
import { Report } from '../models/report/report';
import { BPartnerManager } from '../manager/bpartnerManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { BookingManager } from '../manager/bookingManager';
import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';
import QrcodesRepository from '../db/repository/qrcodesRepository';

import { PoiHelp } from '../models/booking/PoiHelp';
import { POI } from '../models/tours/poiModel';
import { POIManager } from './poiManager';
import { ReportManager } from './reportManager';
import { PreviousTourReport } from '../classes/tour/previousReportTour';
import { ToursWithPoints, PointsForTours, Logo, POICl, PointsShort, PointShort, PointsForGeoJson, ToursForGeoJson } from '../classes/tour/toursWithPoints';
import * as AWS from 'aws-sdk';
import { BPartner } from '../models/bpartner/bpartner';
import { Characteristics, Location, Point, TourData } from '../classes/tour/tourData';
import { PointData } from '../classes/tour/pointData';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
import { resolve } from 'dns/promises';
import { QRCodes } from '../models/qrcodes/qrcodes';
import { MongoRepository } from '../db/repository/mongoRepository';
import userRepository from '../db/repository/userRepository';
import { UserManager } from './userManager';
import { User } from '../models/user/user';
import qrcodesRepository from '../db/repository/qrcodesRepository';
import { setMaxIdleHTTPParsers } from 'http';
import { LocalizedField } from '../models/localizedField';

var sizeOf = require('image-size');
const url = require('url')
const https = require('https')
function makeid(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}
class Size {
	height: string;
	width: string
}

var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})

const s3bucket = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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",
	params: { Bucket: 'hopguides/qrcodes' }
});
var QRCode = require('qrcode')

declare var randomString: string


function getDistanceBetweenPoints(latitude1, longitude1, latitude2, longitude2) {
	let theta = longitude1 - longitude2;
	let distance = 60 * 1.1515 * (180 / Math.PI) * Math.acos(
		Math.sin(latitude1 * (Math.PI / 180)) * Math.sin(latitude2 * (Math.PI / 180)) +
		Math.cos(latitude1 * (Math.PI / 180)) * Math.cos(latitude2 * (Math.PI / 180)) * Math.cos(theta * (Math.PI / 180))
	);

	return distance * 1.609344;

}
export class TourManager {
	tourRepository: TourRepository;
	qrcodesRepository: MongoRepository<QRCodes>;
	bookingRepository: BookingRepository;
	bpartner: BookingRepository;
	bookingManager = new BookingManager();
	userManager = new UserManager();
	poiManager: POIManager;
	reportManager: ReportManager;
	bpartnerManager: BPartnerManager;
	constructor() {
		this.tourRepository = tourRepository;
		this.qrcodesRepository = QrcodesRepository;
		this.bookingRepository = bookingRepository;
		this.poiManager = new POIManager();
		this.reportManager = new ReportManager();
		this.bpartnerManager = new BPartnerManager();
	}


	async saveQr(tourId: string) {


	}


	async generateQr(tourId: string, number: number): Promise<QRCodes[]> {

		var ids = []
		for (var i = 0; i < number; i++) {

			var qrcode: QRCodes = new QRCodes();
			const image_name = Date.now() + "-" + Math.floor(Math.random() * 1000);


			const qrCodeId = Date.now() + "-" + Math.floor(Math.random() * 1000);

			var opts = {
				margin: 1,
				color: {
					dark: "#010599FF",
					light: "#FFBF60FF"
				}
			}
			await QRCode.toDataURL("https://hopguides-server-main-j7limbsbmq-oc.a.run.app/deeplink?url=" + qrCodeId, {
				scale: 15,
				width: "1000px",
			}, async function (err, base64) {
				const base64Data: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
				const type = base64.split(';')[0].split('/')[1];
				const params = {
					Bucket: 'hopguides/qrcodes',
					Key: `${image_name}.png`, // type is not required
					Body: base64Data,
					ACL: 'public-read',
					ContentEncoding: 'base64', // required
					ContentType: `image/${type}` // required. Notice the back ticks
				}
				s3bucket.upload(params, function (err, data) {

					if (err) {
						console.log('ERROR MSG: ', err);
					} else {
						console.log('Successfully uploaded data');
					}
				});

			});

			qrcode.qrcode = `https://hopguides.s3.eu-central-1.amazonaws.com/qrcodes/${image_name}.png`
			qrcode.code = Math.floor(100000000 + Math.random() * 900000000);
			qrcode.used = false;
			qrcode.tourId = tourId
			qrcode.qrCodeId = qrCodeId

			var code = await this.qrcodesRepository.createOne(qrcode).catch(() => {
				throw new CustomError(500, 'QRCode not created!');
			});


			const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
			await delay(1000)
			ids.push(code)

		}

		if (number == 1) {
			for (var codee of ids) {
				const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
				await delay(1000)
				return await this.qrcodesRepository.getAll({ code: codee.code }).catch(() => {
					throw new CustomError(500, 'QRCode not created!');
				});
			}
		} else {

			return ids
		}

		//}
	}


	async generateQRForTour(tourId: string, languages: string[]) {

		var ids = []

		for (var i of languages) {

			var qrcode: QRCodes = new QRCodes();
			const image_name = Date.now() + "-" + Math.floor(Math.random() * 1000);
			const qrCodeId = Date.now() + "-" + Math.floor(Math.random() * 1000);

			await QRCode.toDataURL("https://hopguides-server-main-j7limbsbmq-oc.a.run.app/deeplink?url=" + qrCodeId, {
				scale: 15,
				width: "1000px",
			}, async function (err, base64) {
				const base64Data: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
				const type = base64.split(';')[0].split('/')[1];
				const params = {
					Bucket: 'hopguides/qrcodes',
					Key: `${image_name}.png`, // type is not required
					Body: base64Data,
					ACL: 'public-read',
					ContentEncoding: 'base64', // required
					ContentType: `image/${type}` // required. Notice the back ticks
				}
				s3bucket.upload(params, function (err, data) {

					if (err) {
						console.log('ERROR MSG: ', err);
					} else {
						console.log('Successfully uploaded data');
					}
				});

			});

			var code = Math.floor(100000000 + Math.random() * 900000000);
			qrcode.qrcode = `https://hopguides.s3.eu-central-1.amazonaws.com/qrcodes/${image_name}.png`
			qrcode.code = code;
			qrcode.used = false;
			qrcode.tourId = tourId
			qrcode.qrCodeId = qrCodeId
			qrcode.language = i

			await this.qrcodesRepository.createOne(qrcode).catch(() => {
				throw new CustomError(500, 'QRCode not created!');
			});

		}


	}


	async getQRForTour(tourId: string): Promise<QRCodes[]> {
		var qr: QRCodes[] = await this.qrcodesRepository.getAll().catch((err) => {
			throw new Error('Error getting qr code');
		});

		var qrOfTour: QRCodes[] = []

		for (var qrCode of qr) {
			if (qrCode.tourId == tourId) {
				qrOfTour.push(qrCode)
			}
		}

		return qrOfTour

	}

	async getTour(tourId: string): Promise<Tour> {
		return await this.tourRepository.getByIdOrThrow(tourId.trim()).catch((e) => {

			throw new CustomError(404, 'Tour not found!');
		});
	}

	async getTourById(tourId: string): Promise<Tour> {
		return await this.tourRepository.findOne({ id: tourId }).catch((e) => {

			throw new CustomError(404, 'Tour not found!');
		});
	}


	async getTourByPreviousId(tourId: string): Promise<Tour> {
		return await this.tourRepository.findOne({ previousId: tourId }).catch((e) => {

			throw new CustomError(404, 'Tour not found!');
		});
	}


	async deleteTour(tourId: string) {


		var tour: Tour = await this.getTour(tourId).catch((err) => {
			throw new Error('Error getting Tours');
		});

		for (var poi of tour.points) {
			await this.poiManager.deletePOI(poi).catch((e) => {

				throw new CustomError(404, 'POI not deleted.');
			});
		}
		await this.tourRepository.deleteOne({ _id: tourId }).catch((e) => {

			throw new CustomError(404, 'Tour not deleted.');
		});
	}

	async deleteUpdatedTour(tourId: string) {


		var tour: Tour = await this.getTour(tourId).catch((err) => {
			throw new Error('Error getting Tours');
		});


		await this.tourRepository.deleteOne({ _id: tourId }).catch((e) => {

			throw new CustomError(404, 'Tour not deleted.');
		});
	}



	async deletePoi(tourId: string, poiId: string) {

		console.log("poiIdddd")
		console.log(poiId)
		var tour: Tour = await this.getTour(tourId).catch((err) => {
			throw new Error('Error getting Tours');
		});

		var points = []
		for (var p of tour.points) {
			if (p != poiId) {
				points.push(p)
			}
		}

		tour.points = points
		console.log(points)
		await this.tourRepository.updateOne(tourId, tour).catch((err) => {
			throw new Error('Error updating Tour');
		});


	}

	async calculateSize(buffer: Buffer): Promise<Size> {

		var size = sizeOf(buffer)
		var s: Size = new Size()
		s.height = size.height
		s.width = size.width
		return s;
	}

	async getSize(bpartner: BPartner): Promise<Size> {

		try {
			const imgUrl = bpartner.logo
			const options = url.parse(imgUrl)

			return new Promise(function (resolve, reject) {
				https.get(options, function (response) {
					const chunks = []
					response.on('data', function (chunk) {
						chunks.push(chunk)
					}).on('end', function () {
						const buffer = Buffer.concat(chunks)
						var size = sizeOf(buffer)
						var s: Size = new Size()
						s.height = size.height
						s.width = size.width
						resolve(s)


					})
				})
			})
		} catch {
			return null;
		}
	}

	async getSingleTour(qrCodeId: string, longitude: string, latitude: string, language1: string): Promise<TourData> {

		try {
			var qrcode: QRCodes = new QRCodes()
			if (qrCodeId.length == 9) {
				qrcode = await this.qrcodesRepository.findOne({ code: Number.parseFloat(qrCodeId) }).catch((err) => {
					throw new Error('Error getting qrcode');
				});
			} else {
				qrcode = await this.qrcodesRepository.findOne({ qrCodeId: qrCodeId }).catch((err) => {
					throw new Error('Error getting qrcode');
				});
			}

			/*if(qrcode.used==true){
				throw new Error('You can use this coupon only once a day!');
			}else{
				qrcode.used=true

				await this.qrcodesRepository.updateOne(qrcode.id, qrcode).catch((err) => {
					throw new Error('Error updating qr code');
				});
			}*/

			var language = "english"
			if (qrcode.language) {

				language = qrcode.language
			}

			var tour: Tour = await this.getTourById(qrcode.tourId).catch((err) => {
				throw new Error('Error getting Tours');
			});

			var bpartner: BPartner = await this.bpartnerManager.getBP(tour.bpartnerId).catch((err) => {
				throw new Error('Error getting Tours');
			});

			//const logitudePartner: string = bpartner.contact.location.longitude;
			//const latitudePartner: string = bpartner.contact.location.latitude;

			//var distance = getDistanceBetweenPoints(latitude, longitude, latitudePartner, logitudePartner)


			//if (distance < 0.5) {

			var points: PoiHelp[] = []
			var pointsArr: Point[] = []
			if (tour != null) {
				for (var point of tour.points) {

					var poi: POI = await this.poiManager.getPoi(point)
					if (poi.offerName != "") {
						var p: PoiHelp = new PoiHelp();
						p.id = point
						p.used = false

						const image_name = Date.now() + "-" + Math.floor(Math.random() * 1000);

						p.qrCode = `https://hopguides.s3.eu-central-1.amazonaws.com/qrcodes/${image_name}.png`

						p.name = image_name
						points.push(p)


						var po: Point = new Point();

						if (poi.category == "HISTORY") {

							po.icon = "castle";
						} else if (poi.category == "DRINKS") {

							po.icon = "coffe";
						} else if (poi.category == "NATURE") {

							po.icon = "tree";
						} else if (poi.category == "EATS") {

							po.icon = "restaurant";
						} else if (poi.category == "BRIDGE") {

							po.icon = "archway";
						} else if (poi.category == "MUSEUMS") {

							po.icon = "persona";
						} else if (poi.category == "EXPERIENCE") {

							po.icon = "boat";
						}
						po.id = poi.id;
						po.text = poi.name[language];

						pointsArr.push(po)
					} else {

						var po: Point = new Point();
						if (poi.category == "HISTORY") {

							po.icon = "castle";
						} else if (poi.category == "DRINKS") {

							po.icon = "coffe";
						} else if (poi.category == "NATURE") {

							po.icon = "tree";
						} else if (poi.category == "EATS") {

							po.icon = "restaurant";
						} else if (poi.category == "BRIDGE") {

							po.icon = "archway";
						} else if (poi.category == "MUSEUMS") {

							po.icon = "persona";
						} else if (poi.category == "EXPERIENCE") {

							po.icon = "boat";
						}
						po.id = poi.id;
						po.text = poi.name[language];

						pointsArr.push(po)
					}
				}

				// Create reservation

				var i = (Number)(new Date());
				const createdScheduledRent: Booking = await this.bookingManager.scheduleRent(
					i,
					i,
					tour,
					bpartner,
					points
				);
				if (!createdScheduledRent) throw new CustomError(400, 'Cannot create rent!');



				for (var p of points) {

					QRCode.toDataURL("https://hopguides-web-client-main-j7limbsbmq-oc.a.run.app/#/confirmation/" + createdScheduledRent.id + "/" + p.id, {
						scale: 15,
						width: "1000px"
					}, function (err, base64) {

						const base64Data: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
						const type = base64.split(';')[0].split('/')[1];
						const params = {
							Bucket: 'hopguides/qrcodes',
							Key: `${p.name}.${type}`, // type is not required
							Body: base64Data,
							ACL: 'public-read',
							ContentEncoding: 'base64', // required
							ContentType: `image/${type}` // required. Notice the back ticks
						}
						s3bucket.upload(params, function (err, data) {

							if (err) {
								console.log('ERROR MSG: ', err);
							} else {
								console.log('Successfully uploaded data');
							}
						});
					});

				}



				var logo: Logo = new Logo();
				logo.image = bpartner.logo;
				logo.height = bpartner.dimensions.height
				logo.width = bpartner.dimensions.width



				var characteristicsArr: Characteristics[] = [];
				var characteristics: Characteristics = new Characteristics();
				characteristics.name = "duration";
				characteristics.icon = "duration";
				characteristics.value = tour.duration;


				characteristicsArr.push(characteristics);

				characteristics = new Characteristics();
				characteristics.name = "length";
				characteristics.icon = "distance";
				characteristics.value = tour.length;


				characteristicsArr.push(characteristics);

				characteristics = new Characteristics();
				characteristics.name = "highest point";
				characteristics.icon = "flag";
				characteristics.value = tour.highestPoint;


				characteristicsArr.push(characteristics);

				var tourReport: TourData = new TourData();
				tourReport.tourId = tour.id;
				tourReport.points = pointsArr;
				tourReport.title = tour.title[language];
				tourReport.shortInfo = tour.shortInfo[language];
				tourReport.longInfo = tour.longInfo[language];
				tourReport.image = tour.image;
				tourReport.audio = tour.audio[language];
				tourReport.logo = logo;
				tourReport.characteristics = characteristicsArr;
				tourReport.agreementTitle = tour.agreementTitle[language];
				tourReport.agreementDesc = tour.agreementDesc[language];
				tourReport.termsAndConditionsLink = tour.termsAndConditions;
				tourReport.bookingId = createdScheduledRent.id;
				tourReport.support = bpartner.support[language]
				tourReport.businessPartnerEmail = bpartner.contact.email
				tourReport.businessPartnerPhone = bpartner.contact.phone
				tourReport.lockCode = bpartner.lockCode

				return tourReport
			}
			//}else{

			//console.log("Not in radius")
			//}
		} catch (err) {
			console.log(err)
		}
	}

	async getTourPoints(tourId: string, language: string, bookingId: string): Promise<PointData[]> {

		try {

			var tour: Tour = await this.getTour(tourId).catch((err) => {
				throw new Error('Error getting Tours');
			});

			var bpartner: BPartner = await this.bpartnerManager.getBP(tour.bpartnerId).catch((err) => {
				throw new Error('Error getting Tours');
			});



			var pointsArr: PointData[] = []
			if (tour != null) {
				for (var point of tour.points) {

					var poi: POI = await this.poiManager.getPoi(point)
					if (poi.offerName != "") {

						var location: Location = new Location()
						location.lat = poi.location.latitude;
						location.lng = poi.location.longitude;


						var poiHelp: PointData = new PointData();
						poiHelp.id = poi.id;
						poiHelp.audio = poi.audio[language]
						poiHelp.images = poi.images
						poiHelp.location = location;
						poiHelp.name = poi.name[language]
						poiHelp.shortInfo = poi.shortInfo[language]
						poiHelp.longInfo = poi.longInfo[language]
						poiHelp.offerName = poi.offerName

						if (poi.video != null) {
							poiHelp.video = poi.video[language]
						}

						if (poi.category == "HISTORY") {

							poiHelp.icon = "castle";
						} else if (poi.category == "DRINKS") {

							poiHelp.icon = "coffe";
						} else if (poi.category == "NATURE") {

							poiHelp.icon = "tree";
						} else if (poi.category == "EATS") {

							poiHelp.icon = "restaurant";
						} else if (poi.category == "BRIDGE") {

							poiHelp.icon = "archway";
						} else if (poi.category == "MUSEUMS") {

							poiHelp.icon = "persona";
						} else if (poi.category == "EXPERIENCE") {

							poiHelp.icon = "boat";
						}

						var booking: Booking = await this.bookingManager.getBooking(bookingId)


						poiHelp.hasVoucher = true;
						poiHelp.voucherDesc = poi.voucherDesc[language];
						for (var p of booking.points) {
							if (p.id === poi.id) {
								poiHelp.voucher = p.qrCode
							}
						}

						pointsArr.push(poiHelp)
					} else {
						var location: Location = new Location()
						location.lat = poi.location.latitude;
						location.lng = poi.location.longitude;


						var poiHelp: PointData = new PointData();
						poiHelp.id = poi.id;
						poiHelp.audio = poi.audio[language]
						poiHelp.images = poi.images
						poiHelp.location = location;
						poiHelp.name = poi.name[language]
						poiHelp.shortInfo = poi.shortInfo[language]
						poiHelp.longInfo = poi.longInfo[language]
						poiHelp.hasVoucher = false;
						if (poi.video != null) {
							poiHelp.video = poi.video[language]
						}
						if (poi.category == "HISTORY") {

							poiHelp.icon = "castle";
						} else if (poi.category == "DRINKS") {

							poiHelp.icon = "coffe";
						} else if (poi.category == "NATURE") {

							poiHelp.icon = "tree";
						} else if (poi.category == "EATS") {

							poiHelp.icon = "restaurant";
						} else if (poi.category == "BRIDGE") {

							poiHelp.icon = "archway";
						} else if (poi.category == "MUSEUMS") {

							poiHelp.icon = "persona";
						} else if (poi.category == "EXPERIENCE") {

							poiHelp.icon = "boat";
						}

						pointsArr.push(poiHelp)
					}
				}

				return pointsArr
			}

		} catch (err) {
			console.log(err)
		}
	}

	async getTours(filter?: any, pagination?: SearchPagination): Promise<Tour[]> {
		return await this.tourRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting Tours');
		});
	}



	async getToursWithPoints(id: string, update: boolean, filter?: any, pagination?: SearchPagination): Promise<ToursWithPoints[]> {

		try {

			var user: User = await this.userManager.getUser(id)
			var role = user.role
			var toursReport: ToursWithPoints[] = []
			var tours: Tour[] = []
			if (role == "ADMIN") {
				console.log("Admin")
				tours = await this.tourRepository.getAll({ update: update }, pagination).catch((err) => {
					throw new Error('Error getting Tours');
				});
			} else if (role == "USER" || role == "BPARTNER") {
				throw new Error('You are unable to get all the available tours');
			} else if (role == "PROVIDER") {

				var bpartner: BPartner = await this.bpartnerManager.getBPByUser(id).catch((err) => {
					throw new Error('Error getting business partner');
				});
				tours = await this.tourRepository.getAll({ bpartnerId: bpartner.id }, pagination).catch((err) => {
					throw new Error('Error getting Tours');
				});
			}

			for (var tour of tours) {


				var tourReport: ToursWithPoints = new ToursWithPoints();
				tourReport.tourId = tour.id;
				tourReport.title = tour.title;
				tourReport.bpartnerId = tour.bpartnerId;
				toursReport.push(tourReport)
			}

			return toursReport
		} catch (err) {
			console.log(err.error)
		}
	}

	async searchForTours(id: string, searchData: string, filter?: any): Promise<ToursWithPoints[]> {
		try {
			const user: User = await this.userManager.getUser(id);
			const role = user.role;
			let tours: Tour[] = [];

			const searchRegex = new RegExp(searchData, 'i');

			if (role === "ADMIN") {
				tours = await this.tourRepository.getAll(
					{ "title.english": { $regex: searchRegex } }
				).catch((err) => {
					throw new Error('Error getting Tours');
				});
			} else if (role === "USER" || role === "BPARTNER") {
				throw new Error('You are unable to get all the available tours');
			} else if (role === "PROVIDER") {
				const bpartner: BPartner = await this.bpartnerManager.getBPByUser(id).catch((err) => {
					throw new Error('Error getting business partner');
				});
				tours = await this.tourRepository.getAll(
					{ bpartnerId: bpartner.id, "title.english": { $regex: searchRegex } }
				).catch((err) => {
					throw new Error('Error getting Tours');
				});
			}

			const toursReport: ToursWithPoints[] = tours.map(tour => {
				const tourReport = new ToursWithPoints();
				tourReport.tourId = tour.id;
				tourReport.title = tour.title;
				tourReport.bpartnerId = tour.bpartnerId;
				return tourReport;
			});

			return toursReport;
		} catch (err) {
			throw new Error('Error getting Tours');
		}
	}



	async getTourData(id: string): Promise<Tour> {

		try {

			var tour: Tour = await this.getTour(id)

			var pois = []

			for (var poi of tour.points) {
				var p: POI = await this.poiManager.getPoi(poi)
				pois.push(p)
			}

			tour.points = pois
			return tour
		} catch (err) {
			console.log(err)
		}
	}



	async getPoiData(id: string): Promise<POI> {

		try {

			var poi: POI = await this.poiManager.getPoi(id)

			return poi
		} catch (err) {
			console.log(err)
		}
	}


	async rearrangePoints(id: string, points: POI[]): Promise<void> {
		try {
			console.log("Rearranging points...");
			console.log(points);
	
			// Fetch the tour by ID
			var tour = await this.tourRepository.getByIdOrThrow(id);
	
			// Map the points to their IDs
			var poiIds = points.map(poi => poi.id);
	
			// Update the tour's points with the new order
			tour.points = poiIds;
	
			// Save the updated tour
			await this.tourRepository.updateOne(id, tour).catch((err) => {
				throw new Error('Error updating Tour');
			});
	
			console.log('Points order updated successfully');
	
		} catch (err) {
			console.error('Error rearranging points:', err);
		}
	}



	async getToursWithPointsForMapbox(id: string, filter?: any, pagination?: SearchPagination): Promise<ToursForGeoJson> {

		try {


			const bookings: Booking[] = await this.bookingRepository.getAll(filter, pagination).catch(() => {
				throw new Error('Error getting bookings');
			});
			var tour: Tour = await this.getTour(id).catch((err) => {
				throw new Error('Error getting Tours');
			});



			var points: PointsForGeoJson[] = []
			for (var point of tour.points) {

				var poi: POI = await this.poiManager.getPoi(point)

				var poiHelp: PointsForGeoJson = new PointsForGeoJson();

				poiHelp.id = poi.id;
				poiHelp.location = poi.location;


				points.push(poiHelp)

			}

			var tourReport: ToursForGeoJson = new ToursForGeoJson();
			tourReport.tourId = tour.id;
			tourReport.points = points;


			return tourReport
		} catch (err) {
			console.log(err)
		}
	}




	async getPreviousReportForTour(tourId: string, filter: any, pagination?: any): Promise<PreviousTourReport[]> {

		var groupByArray = function (xs, key) {
			return xs.reduce(function (rv, x) {
				let v = key instanceof Function ? key(x) : x[key]; let el = rv.find((r) => r && r.key === v);
				if (el) { el.values.push(x); }
				else { rv.push({ key: v, values: [x] }); }
				return rv;
			}, []);
		}


		const bookings: Booking[] = await this.bookingRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting bookings');
		});



		interface helpObject {
			from: string;
			id: string;
		};


		var helpArray: helpObject[] = [];

		for (var booking of bookings) {


			if (booking.tourId == tourId) {
				var date = new Date(booking.from);

				let monthBooking: number = date.getMonth();
				let yearBooking: number = date.getFullYear();

				let helpObject: helpObject = { from: monthBooking.toString() + yearBooking.toString(), id: tourId }

				helpArray.push(helpObject);

			}
		}



		helpArray = groupByArray(helpArray, 'from');

		interface helpObjectSort {
			from: string;
			count: number;
		};

		class objectStr {
			key: string;
			values: helpObject[];
		};

		interface helpObjectSort {
			from: string;
			count: number;
		};

		var helpArraySort: helpObjectSort[] = []

		helpArray.forEach((element) => {

			var obj = Object.assign(new objectStr, element)

			var helpArrayObj = { from: obj.key, count: obj.values.length }
			helpArraySort.push(helpArrayObj)
		});



		return helpArraySort;
	}

	async updateTour(tourId: string, data: Partial<Tour>) {

		return await this.tourRepository.updateOne(tourId, data).catch((err) => {
			throw new Error('Error updating Tour');
		});

	}

	async createTour(tour: Tour): Promise<Tour> {
		return await this.tourRepository.createOne(tour).catch(() => {
			throw new CustomError(500, 'Tour not created!');
		});
	}


	async uploadMenu(tourId: string, file: MulterFile): Promise<Tour> {
		var tour: Tour = await this.getTour(tourId)

		tour.image = file.location
		return await this.tourRepository.updateOne(tourId, tour).catch(() => {
			throw new Error('Error updating Tour');
		});
	}


	async uploadAudio(tourId: string, file: MulterFile, language: string): Promise<Tour> {
		var tour: Tour = await this.getTour(tourId)

		tour.audio[language] = file.location
		return await this.tourRepository.updateOne(tourId, tour).catch(() => {
			throw new Error('Error updating Tour');
		});
	}

	async getTermsAndConditions(tourId: string): Promise<string> {
		var tour: Tour = await this.getTour(tourId)
		return tour.termsAndConditions


	}
}