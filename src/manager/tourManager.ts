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

import { POI } from '../models/tours/poi';
import { POIManager } from './poiManager';
import { ReportManager } from './reportManager';
import { PreviousTourReport } from '../classes/tour/previousReportTour';
import { ToursWithPoints, PointsForTours } from '../classes/tour/toursWithPoints';
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
		await QRCode.toFile('images/tourQrCodes/'+tourId.trim() +"---"+providerId.trim() + ".png","http://localhost:3000/deeplink?url=https://www.youtube.com/watch?v=AYO-17BDVCw&list=RDAYO-17BDVCw&start_radio=1", {
			scale: 15,
			width: "1000px"
		  }, function (err) {
			if (err) throw err
			console.log('done')
			return true
		  })

		return true
	}

	async getTour(tourId: string): Promise<Tour> {
		return await this.tourRepository.getByIdOrThrow(tourId).catch(() => {
			throw new CustomError(404, 'Tour not found!');
		});
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
			tourReport.tourName = tour.title.en;
			tourReport.tourPrice = tour.price;
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
			tourReport.tourName = tour.title.en;

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
}
