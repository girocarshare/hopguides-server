import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { Tour } from '../models/tours/tour';
import { S3Service } from '../utils/s3Service';
import { MulterFile } from '../classes/interfaces';
import { ToursReport } from '../classes/tour/toursReport';
import * as multer from 'multer';
import { Report } from '../models/report/report';
import { BPartnerManager } from '../manager/bpartnerManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { BookingManager } from '../manager/bookingManager';
import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';

import { PoiHelp } from '../models/booking/PoiHelp';
import { POI } from '../models/tours/poiModel';
import { POIManager } from './poiManager';
import { ReportManager } from './reportManager';
import { PreviousTourReport } from '../classes/tour/previousReportTour';
import { ToursWithPoints, PointsForTours, Logo, POICl } from '../classes/tour/toursWithPoints';
import * as AWS from 'aws-sdk';
import { BPartner } from '../models/bpartner/bpartner';
import { Characteristics, Point, TourData } from '../classes/tour/tourData';
var multerS3 = require('multer-s3');
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
	bookingRepository: BookingRepository;
	bpartner: BookingRepository;
	bookingManager = new BookingManager();
	s3Service: S3Service;
	poiManager: POIManager;
	reportManager: ReportManager;
	bpartnerManager: BPartnerManager;
	constructor() {
		this.tourRepository = tourRepository;
		this.bookingRepository = bookingRepository;
		this.s3Service = new S3Service("giromobility-dev");
		this.poiManager = new POIManager();
		this.reportManager = new ReportManager();
		this.bpartnerManager = new BPartnerManager();
	}




	async generateQr(tourId: string, providerId: string): Promise<boolean> {

		//change url


		QRCode.toDataURL("http://localhost:3000/deeplink?url=https://www.youtube.com/watch?v=AYO-17BDVCw&list=RDAYO-17BDVCw&start_radio=1", {
			scale: 15,
			width: "1000px"
		}, function (err, base64) {
			const base64Data: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
			const type = base64.split(';')[0].split('/')[1];
			const image_name = Date.now() + "-" + Math.floor(Math.random() * 1000);
			const params = {
				Bucket: 'hopguides/qrcodes',
				Key: `${image_name}.${type}`, // type is not required
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




		return true
	}

	async getTour(tourId: string): Promise<Tour> {
		return await this.tourRepository.getByIdOrThrow(tourId).catch(() => {
			throw new CustomError(404, 'Tour not found!');
		});
	}

	/*async getSingleTour(tourId: string, longitude: string, latitude: string, language: string): Promise<ToursWithPoints> {

		try {

			var tour: Tour = await this.getTour(tourId).catch((err) => {
				throw new Error('Error getting Tours');
			});

			var bpartner: BPartner = await this.bpartnerManager.getBP(tour.bpartnerId).catch((err) => {
				throw new Error('Error getting Tours');
			});

			const logitudePartner: string = bpartner.contact.location.longitude;
			const latitudePartner: string = bpartner.contact.location.latitude;

			var distance = getDistanceBetweenPoints(latitude, longitude, latitudePartner, logitudePartner)


			if (distance > 0.5) {

				var points: PoiHelp[] = []
				var pointsArr: PointsForTours[] = []
				if (tour != null) {
					for (var point of tour.points) {

						var poi: POI = await this.poiManager.getPoi(point)
						if (poi.offerName != "") {
							var p: PoiHelp = new PoiHelp();
							p.id = point
							p.used = false

							const image_name = Date.now() + "-" + Math.floor(Math.random() * 1000);
							QRCode.toDataURL("http://localhost:3000/deeplink", {
								scale: 15,
								width: "1000px"
							}, function (err, base64) {

								const base64Data: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
								const type = base64.split(';')[0].split('/')[1];
								const params = {
									Bucket: 'hopguides/qrcodes',
									Key: `${image_name}.${type}`, // type is not required
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


							p.qrCode = 'https://hopguides.s3.eu-central-1.amazonaws.com/gqcodes/' + image_name + ".png"

							points.push(p)


							var po: PointsForTours = new PointsForTours();
							var poiHelp: POICl = new POICl()
							poiHelp.id = poi.id;
							poiHelp.audio = poi.audio
							poiHelp.bpartnerId = poi.bpartnerId
							poiHelp.category = poi.category;
							poiHelp.contact = poi.contact
							poiHelp.workingHours = poi.workingHours
							poiHelp.files = poi.files;
							poiHelp.icon = poi.icon
							poiHelp.images = poi.images
							poiHelp.location = poi.location;
							poiHelp.name = poi.name
							poiHelp.images = poi.images
							poiHelp.shortInfo = poi.shortInfo[language]
							poiHelp.longInfo = poi.longInfo[language]
							poiHelp.menu = poi.menu
							poiHelp.offerName = poi.offerName
							poiHelp.price = poi.price



							po.point = poiHelp

							var report: Report = await this.reportManager.getReport(poi.id, {})

							po.monthlyUsed = report.monthlyUsedCoupons;

							po.voucher = 'https://hopguides.s3.eu-central-1.amazonaws.com/gqcodes/' + image_name + ".png"
							
							po.voucherDesc = poi.voucherDesc[language]


							po.hasVoucher = true;

							pointsArr.push(po)
						}else{
							var po: PointsForTours = new PointsForTours();
							var poiHelp: POICl = new POICl()
							poiHelp.id = poi.id;
							poiHelp.audio = poi.audio
							poiHelp.bpartnerId = poi.bpartnerId
							poiHelp.category = poi.category;
							poiHelp.contact = poi.contact
							poiHelp.workingHours = poi.workingHours
							poiHelp.files = poi.files;
							poiHelp.icon = poi.icon
							poiHelp.images = poi.images
							poiHelp.location = poi.location;
							poiHelp.name = poi.name
							poiHelp.images = poi.images
							poiHelp.title = poi.title[language]
							poiHelp.shortInfo = poi.shortInfo[language]
							poiHelp.longInfo = poi.longInfo[language]
							poiHelp.menu = poi.menu
							poiHelp.offerName = poi.offerName
							poiHelp.price = poi.price

							po.point = poiHelp
							var report: Report = await this.reportManager.getReport(poi.id, {})

							po.monthlyUsed = 0;

							po.hasVoucher = false;
						

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

				var logo: Logo = new Logo();
				logo.image = bpartner.logo;
				logo.height = bpartner.dimensions.height;
				logo.width = bpartner.dimensions.width;

				var tourReport: ToursWithPoints = new ToursWithPoints();
				tourReport.tourId = tour.id;
				tourReport.points = pointsArr;
				tourReport.title = tour.title[language];
				tourReport.shortInfo = tour.shortInfo[language];
				tourReport.longInfo = tour.longInfo[language];
				tourReport.currency = tour.currency;
				tourReport.images = tour.images;
				tourReport.price = tour.price;
				tourReport.image = tour.image;
				tourReport.audio = tour.audio;
				tourReport.duration = tour.duration;
				tourReport.length = tour.length;
				tourReport.logo = logo;
				tourReport.highestPoint = tour.highestPoint;
				tourReport.agreementTitle = tour.agreementTitle[language];
				tourReport.agreementDesc = tour.agreementDesc[language];
				tourReport.partnerName = bpartner.name;
				tourReport.support = bpartner.support[language];
				tourReport.termsAndConditions = tour.termsAndConditions;

				return tourReport
				}
			}else{
				
			console.log("Not in radius")
			}
		} catch (err) {
			console.log(err)
		}
	}*/

	async getSingleTour(tourId: string, longitude: string, latitude: string, language: string): Promise<TourData> {

		try {

			var tour: Tour = await this.getTour(tourId).catch((err) => {
				throw new Error('Error getting Tours');
			});

			var bpartner: BPartner = await this.bpartnerManager.getBP(tour.bpartnerId).catch((err) => {
				throw new Error('Error getting Tours');
			});

			const logitudePartner: string = bpartner.contact.location.longitude;
			const latitudePartner: string = bpartner.contact.location.latitude;

			var distance = getDistanceBetweenPoints(latitude, longitude, latitudePartner, logitudePartner)


			if (distance > 0.5) {

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
							QRCode.toDataURL("http://localhost:3000/deeplink", {
								scale: 15,
								width: "1000px"
							}, function (err, base64) {

								const base64Data: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
								const type = base64.split(';')[0].split('/')[1];
								const params = {
									Bucket: 'hopguides/qrcodes',
									Key: `${image_name}.${type}`, // type is not required
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


							p.qrCode = 'https://hopguides.s3.eu-central-1.amazonaws.com/gqcodes/' + image_name + ".png"

							points.push(p)


							var po: Point = new Point();
							po.category = poi.category;
							po.id = poi.id;
							po.name = poi.name;

							pointsArr.push(po)
						}else{
							
							var po: Point = new Point();
							po.category = poi.category;
							po.id = poi.id;
							po.name = poi.name;

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

				var logo: Logo = new Logo();
				logo.image = bpartner.logo;
				logo.height = bpartner.dimensions.height;
				logo.width = bpartner.dimensions.width;

				var characteristicsArr : Characteristics[] = [];
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
				tourReport.audio = tour.audio;
				tourReport.logo = logo;
				tourReport.characteristics = characteristicsArr;
				tourReport.agreementTitle = tour.agreementTitle[language];
				tourReport.agreementDesc = tour.agreementDesc[language];
				tourReport.termsAndConditionsLink = tour.termsAndConditions;

				return tourReport
				}
			}else{
				
			console.log("Not in radius")
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

	async getToursForReport(filter?: any, pagination?: SearchPagination): Promise<ToursReport[]> {

		var toursReport: ToursReport[] = []

		const bookings: Booking[] = await this.bookingRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting bookings');
		});
		var tours: Tour[] = await this.tourRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting Tours');
		});



		for (var tour of tours) {
			var count = 0
			let monthIndex: number = new Date().getMonth();
			let yearIndex: number = new Date().getFullYear();

			for (var booking of bookings) {
				var date = new Date(booking.from);

				let monthBooking: number = date.getMonth();
				let yearBooking: number = date.getFullYear();


				if (booking.tourId == tour.id && monthIndex == monthBooking && yearBooking == yearIndex) {

					count = count + 1
				}



			}


			var tourReport: ToursReport = new ToursReport();
			tourReport.tourId = tour.id;
			tourReport.tourName = tour.title.english;
			tourReport.tourPrice = tour.price;
			tourReport.currency = tour.currency;
			tourReport.noOfRidesAMonth = count;

			toursReport.push(tourReport)

		}
		return toursReport
	}


	async getToursWithPoints(filter?: any, pagination?: SearchPagination): Promise<ToursWithPoints[]> {

		try {
			var toursReport: ToursWithPoints[] = []

			var tours: Tour[] = await this.tourRepository.getAll(filter, pagination).catch((err) => {
				console.log(err)
				throw new Error('Error getting Tours');
			});

			const bookings: Booking[] = await this.bookingRepository.getAll(filter, pagination).catch(() => {
				throw new Error('Error getting bookings');
			});


			for (var tour of tours) {

				var count = 0
			let monthIndex: number = new Date().getMonth();
			let yearIndex: number = new Date().getFullYear();

			for (var booking of bookings) {
				var date = new Date(booking.from);

				let monthBooking: number = date.getMonth();
				let yearBooking: number = date.getFullYear();


				if (booking.tourId == tour.id && monthIndex == monthBooking && yearBooking == yearIndex) {

					count = count + 1
				}



			}




				var points: PointsForTours[] = []
				for (var point of tour.points) {

					var language = "english"
					var poi: POI = await this.poiManager.getPoi(point)

					var p: PointsForTours = new PointsForTours();
					var poiHelp: POICl = new POICl()
					poiHelp.id = poi.id;
					poiHelp.audio = poi.audio
					poiHelp.bpartnerId = poi.bpartnerId
					poiHelp.category = poi.category;
					poiHelp.contact = poi.contact
					poiHelp.workingHours = poi.workingHours
					poiHelp.files = poi.files;
					poiHelp.icon = poi.icon
					poiHelp.images = poi.images
					poiHelp.location = poi.location;
					poiHelp.name = poi.name
					poiHelp.images = poi.images
					poiHelp.shortInfo = poi.shortInfo[language]
					poiHelp.longInfo = poi.longInfo[language]
					poiHelp.menu = poi.menu
					poiHelp.offerName = poi.offerName
					poiHelp.price = poi.price

					p.point = poiHelp

					var report: Report = await this.reportManager.getReport(poi.id, {})

					p.monthlyUsed = report.monthlyUsedCoupons;

					points.push(p)

				}

				var tourReport: ToursWithPoints = new ToursWithPoints();
				tourReport.tourId = tour.id;
				tourReport.points = points;
				tourReport.title = tour.title[language];
				tourReport.shortInfo = tour.shortInfo[language];
				tourReport.longInfo = tour.longInfo[language];
				tourReport.currency = tour.currency;
				tourReport.images = tour.images;
				tourReport.price = tour.price;
				tourReport.image = tour.image;
				tourReport.audio = tour.audio;
				tourReport.duration = tour.duration;
				tourReport.length = tour.length;
				tourReport.highestPoint = tour.highestPoint;
				tourReport.agreementTitle = tour.agreementTitle[language];
				tourReport.agreementDesc = tour.agreementDesc[language];
				tourReport.termsAndConditions = tour.termsAndConditions;
				tourReport.noOfRidesAMonth = count;


				toursReport.push(tourReport)
			}



			return toursReport
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

		await this.tourRepository.updateOne(tourId, data).catch((err) => {
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


	async uploadAudio(tourId: string, file: MulterFile): Promise<Tour> {
		var tour: Tour = await this.getTour(tourId)

		tour.audio = file.location
		return await this.tourRepository.updateOne(tourId, tour).catch(() => {
			throw new Error('Error updating Tour');
		});
	}
}