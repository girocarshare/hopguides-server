import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
import { POI } from '../models/tours/poi';
import { PoiHelp } from '../models/booking/PoiHelp';
import { CustomError } from '../classes/customError';
import { BPartner } from '../models/bpartner/bpartner';
import { BPartnerManager } from '../manager/bpartnerManager';
import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { POIManager } from '../manager/poiManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { deserialize, serialize } from '../json';
var QRCode = require('qrcode')
interface helpObjectSort {
	from: string;
	count: number;
  };

export class ReportManager {
	bookingRepository: BookingRepository;
	tourRepository: TourRepository;
	poiManager: POIManager;
	bpartnerManager: BPartnerManager;


	constructor() {
		this.bookingRepository = bookingRepository;
		this.tourRepository = tourRepository;
		this.poiManager = new POIManager();
		this.bpartnerManager = new BPartnerManager();

	}

	async getReport(companyId: string, filter: any, pagination?: any): Promise<Report> {
		const bookings: Booking[] = await this.bookingRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting bookings');
		});

		const p: POI = await this.poiManager.getPoi(companyId).catch(() => {
			throw new Error('Error getting poi');
		});
		const bPartner: BPartner = await this.bpartnerManager.getBPByUser(p.bpartnerId).catch(() => {
			throw new Error('Error getting business partner');
		});


		var count = 0
		let monthIndex: number = new Date().getMonth();
		let yearIndex: number = new Date().getFullYear();


		for (var booking of bookings) {
			var date = new Date(booking.from);

			let monthBooking: number = date.getMonth();
			let yearBooking: number = date.getFullYear();
			for (var point of booking.points) {

				if (point.id.toString() == companyId && point.used && monthIndex == monthBooking && yearBooking == yearIndex) {

					count = count + 1
				}

			}

		}

		const report: Report = new Report();
		report.pointId = companyId;
		report.monthlyUsedCoupons = count;
		report.name = p.title.en;
		report.bpartnerName = bPartner.name;
		report.bpartnerEmail = bPartner.contact.email;
		report.bpratnerPhone = bPartner.contact.phone;
		report.bpratnerPhone2 = bPartner.contact.phone2;
		report.offerName = p.offerName;

		return report
	}

	
	async getReports(companyId: string, filter: any, pagination?: any): Promise<helpObjectSort[]> {

		var groupByArray = function(xs, key) { 
			return xs.reduce(function (rv, x) { 
				let v = key instanceof Function ? key(x) : x[key]; let el = rv.find((r) => r && r.key === v);
				 if (el) { el.values.push(x); }
				  else { rv.push({ key: v, values: [x] }); }
				   return rv; }, []); } 
		  

		  const bookings: Booking[] = await this.bookingRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting bookings');
		});



		interface helpObject {
			from: string;
			points: PoiHelp[];
		  };
		   

		var helpArray : helpObject[] = [];

		for (var booking of bookings) {

			for (var point of booking.points) {

				if (point.id.toString() == companyId && point.used) {
					var date = new Date(booking.from);

					let monthBooking: number = date.getMonth();
					let yearBooking: number = date.getFullYear();

					let helpObject : helpObject = {from : monthBooking.toString() + yearBooking.toString(), points: booking.points}

					helpArray.push(helpObject);

				}

			}


		}


		
		helpArray = groupByArray(helpArray, 'from');

		interface helpObjectSort {
			from: string;
			count: number;
		  };

		  var helpArraySort: helpObjectSort[] = []

	
		  class objectStr {
			key: string;
			values: helpObject[];
		  };

		  interface helpObjectSort {
			from: string;
			count: number;
		  };

		  var helpArraySort: helpObjectSort[] = []
		  
		  helpArray.forEach( (element) => {

			var obj = Object.assign(new objectStr, element)

			var helpArrayObj = {from : obj.key, count: obj.values.length}
			helpArraySort.push(helpArrayObj)
		});

		
		  

		return helpArraySort;
	}


	async generateQr(companyId: string): Promise<boolean> {

		//let datajson = JSON.stringify(data);
		/*QRCode.toString(datajson, {type: "terminal"}, function (err, code){
			console.log(code)
		})*/

		/*QRCode.toDataURL(datajson, function (err, code){
			console.log(code)
		})*/

		await QRCode.toFile(companyId.trim() + ".png","http://localhost:3001/#/report/", {
			scale: 15,
			width: "1000px"
		  }, function (err) {
			if (err) throw err
			console.log('done')
		  })

		return true
	}


}
