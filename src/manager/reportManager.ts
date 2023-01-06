import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
import { POI } from '../models/tours/poi';
import { CustomError } from '../classes/customError';
import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { POIManager } from '../manager/poiManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { deserialize , serialize} from '../json';
var QRCode = require('qrcode')
export class ReportManager {
	bookingRepository: BookingRepository;
	tourRepository: TourRepository;
	poiManager: POIManager;


	constructor() {
		this.bookingRepository = bookingRepository;
		this.tourRepository = tourRepository;
		this.poiManager = new POIManager();
		
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

			/*for(var point of tour.points){
				var poi : POI =  await this.poiManager.getPoi(point.id);
				if(poi.id.toString() == companyId && point.used){

					count = count + 1
				}
			}*/
		}

		const report: Report = new Report();
		report.pointId = companyId;
		report.monthlyUsedCoupons = count;
		return report
	}

	async generateQr(companyId: string): Promise<string> {

		const data = {
			"name" : "Some nameee"
		}

		let datajson = JSON.stringify(data);
		/*QRCode.toString(datajson, {type: "terminal"}, function (err, code){
			console.log(code)
		})*/

		/*QRCode.toDataURL(datajson, function (err, code){
			console.log(code)
		})*/
		QRCode.toFile("qr.png", datajson, function (err){
	
		})
		  return "ok"
	}


}
