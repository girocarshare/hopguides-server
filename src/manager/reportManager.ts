import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
import { CustomError } from '../classes/customError';
import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { Booking, BookingStatus } from '../models/booking/booking';
import { deserialize , serialize} from '../json';
export class ReportManager {
	bookingRepository: BookingRepository;
	tourRepository: TourRepository;


	constructor() {
		this.bookingRepository = bookingRepository;
		this.tourRepository = tourRepository;
		
	}

	async getReport(companyId: string,filter: any, pagination?: any): Promise<Report> {
		const bookings: Booking[] = await this.bookingRepository.getAll(filter,pagination ).catch(() => {
			throw new Error('Error getting bookings');
		});
		
		var count = 0
		for(var booking of bookings){
		
			const tour: Tour = await this.tourRepository.getByIdOrThrow(booking.tourId ).catch(() => {
				throw new Error('Error getting tour');
			});

			for(var point of tour.points){
				if(point.id.toString() == companyId && point.used){

					count = count + 1
				}
			}
		}

		const report: Report = new Report();
		report.pointId = companyId;
		report.monthlyUsedCoupons = count;
		return report
	}


}
