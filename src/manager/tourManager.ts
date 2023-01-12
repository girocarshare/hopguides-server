import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { Tour } from '../models/tours/tour';
//import { deserializeFromDb } from '../db/dbUtils';
//import { GetTourPayload } from '../classes/tour/getTourPayload';
import { S3Service } from '../utils/s3Service';
import { MulterFile } from '../classes/interfaces';
import { ToursReport } from '../classes/tour/toursReport';
import * as multer from 'multer';
import { Booking, BookingStatus } from '../models/booking/booking';
import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';


	
declare  var randomString: string
export class TourManager {
	tourRepository: TourRepository;
	bookingRepository: BookingRepository;
	s3Service: S3Service;
	constructor() {
		this.tourRepository = tourRepository;
		this.bookingRepository = bookingRepository;
		this.s3Service = new S3Service("giromobility-dev");
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

	

		for(var tour of tours){
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

			
			var tourReport : ToursReport = new ToursReport();
			tourReport.tourId = tour.id;
			tourReport.tourName = tour.title.en;
			tourReport.tourPrice = tour.price;
			tourReport.noOfRidesAMonth = count;

			toursReport.push(tourReport)

		}
		return toursReport
	}


	/*async __uploadFile(tourId: string, file: MulterFile): Promise<Tour> {
		const url = await this.s3Service.uploadMenuFile(tourId, file).catch(() => {
			throw new Error('Error uploading file for Rent');
		});

		return await this.updateMenuPhoto(tourId, {
			$set: { returnImage: url },
			$push: { returnImages: url }
		});
	}
	async updateMenuPhoto(tourId: string, data: any): Promise<Tour> {
		return await this.tourRepository.update(tourId, data).catch(() => {
			throw new Error('Error updating Rent');
		});
	}*/
	/*async getTranslatedTour(tourId: string, locale: string = 'en'): Promise<any> {
		const aggregateFilter: any[] = [];
		aggregateFilter.push({
			$match: {
				_id: tourId
			}
		});
		aggregateFilter.push({
			$set: {
				id: '$_id',
				title: `$title.${locale}`,
				longInfo: `$longInfo.${locale}`,
				timeInfo: `$timeInfo.${locale}`,
				paymentInfo: `$paymentInfo.${locale}`,
				shortInfo: `$shortInfo.${locale}`,
				points: {
					$map: {
						input: '$points',
						as: 'point',
						in: {
							$mergeObjects: [
								'$$point',
								{
									title: `$$point.title.${locale}`,
									shortInfo: `$$point.shortInfo.${locale}`,
									longInfo: `$$point.longInfo.${locale}`
								}
							]
						}
					}
				}
			}
		});
		const tour = await this.tourRepository.aggregate(aggregateFilter);
		if (tour) return deserializeFromDb(GetTourPayload, tour[0]);
		else throw new CustomError(404, 'tour not found');
	}
*/
	async updateTour(tourId: string, data: Partial<Tour>): Promise<Tour> {
		return await this.tourRepository.updateOne(tourId, data).catch(() => {
			throw new Error('Error updating Tour');
		});
	}

	async createTour(tour: Tour): Promise<Tour> {
		return await this.tourRepository.createOne(tour).catch(() => {
			throw new CustomError(500, 'Tour not created!');
		});
	}
}
