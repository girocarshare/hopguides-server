import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { Tour } from '../models/tours/tour';
import { S3Service } from '../utils/s3Service';
import { MulterFile } from '../classes/interfaces';
import { ToursReport } from '../classes/tour/toursReport';
import * as multer from 'multer';
import { Report } from '../models/report/report';
import { Booking, BookingStatus } from '../models/booking/booking';
import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';

import { POI } from '../models/tours/poiModel';
import { POIManager } from './poiManager';
import { ReportManager } from './reportManager';
import { PreviousTourReport } from '../classes/tour/previousReportTour';
import { ToursWithPoints, PointsForTours } from '../classes/tour/toursWithPoints';
import * as AWS from 'aws-sdk';
var multerS3 = require('multer-s3');
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})

const s3bucket = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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",
	params: {Bucket: 'hopguides/qrcodes'}});
var QRCode = require('qrcode')

declare var randomString: string
export class TourManager {
	tourRepository: TourRepository;
	bookingRepository: BookingRepository;
	s3Service: S3Service;
	poiManager: POIManager;
	reportManager: ReportManager;
	constructor() {
		this.tourRepository = tourRepository;
		this.bookingRepository = bookingRepository;
		this.s3Service = new S3Service("giromobility-dev");
		this.poiManager = new POIManager();
		this.reportManager = new ReportManager();
	}




	async generateQr(tourId: string, providerId: string): Promise<boolean> {

		//change url


		QRCode.toDataURL("http://localhost:3000/deeplink?url=https://www.youtube.com/watch?v=AYO-17BDVCw&list=RDAYO-17BDVCw&start_radio=1", {scale: 15,
		width: "1000px"},function (err, base64) {
			const base64Data : Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
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

	
	async getSingleTour(tourId: string): Promise<ToursWithPoints> {

		try{

			console.log(tourId)
		var tour: Tour = await this.getTour(tourId).catch((err) => {
			console.log(err)
			throw new Error('Error getting Tours');
		});
			
			var points: PointsForTours[]  = []
			for(var point of tour.points){
			
					var poi: POI = await this.poiManager.getPoi(point)

					var p : PointsForTours = new PointsForTours();
					p.point = poi;

					var report : Report = await this.reportManager.getReport(poi.id, {})

					p.monthlyUsed = report.monthlyUsedCoupons;

					points.push(p)

			}

			var tourReport : ToursWithPoints = new ToursWithPoints();
			tourReport.tourId = tour.id;
			tourReport.points = points;
			tourReport.title = tour.title;
			tourReport.shortInfo = tour.shortInfo;
			tourReport.longInfo = tour.longInfo;
			tourReport.currency = tour.currency;
			tourReport.images = tour.images;
			tourReport.price = tour.price;
			tourReport.image = tour.image;
			tourReport.audio = tour.audio;
			tourReport.duration = tour.duration;
			tourReport.length = tour.length;
			tourReport.highestPoint = tour.highestPoint;
			tourReport.termsAndConditions = tour.termsAndConditions;


			

			
		
		return tourReport
		}catch(err){
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

		try{
		var toursReport: ToursWithPoints[] = []

		var tours: Tour[] = await this.tourRepository.getAll(filter, pagination).catch((err) => {
			console.log(err)
			throw new Error('Error getting Tours');
		});



		for (var tour of tours) {
			
			var points: PointsForTours[]  = []
			for(var point of tour.points){
			
					var poi: POI = await this.poiManager.getPoi(point)

					var p : PointsForTours = new PointsForTours();
					p.point = poi;

					var report : Report = await this.reportManager.getReport(poi.id, {})

					p.monthlyUsed = report.monthlyUsedCoupons;

					points.push(p)

			}

			var tourReport : ToursWithPoints = new ToursWithPoints();
			tourReport.tourId = tour.id;
			tourReport.points = points;
			tourReport.title = tour.title;
			tourReport.shortInfo = tour.shortInfo;
			tourReport.longInfo = tour.longInfo;
			tourReport.currency = tour.currency;
			tourReport.images = tour.images;
			tourReport.price = tour.price;
			tourReport.image = tour.image;
			tourReport.audio = tour.audio;
			tourReport.duration = tour.duration;
			tourReport.length = tour.length;
			tourReport.highestPoint = tour.highestPoint;
			tourReport.termsAndConditions = tour.termsAndConditions;


			toursReport.push(tourReport)
			}

			
		
		return toursReport
		}catch(err){
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