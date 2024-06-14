import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
import { POI } from '../models/tours/poiModel';
import { PoiHelp } from '../models/booking/PoiHelp';
import { CustomError } from '../classes/customError';
import { BPartner } from '../models/bpartner/bpartner';
import { BPartnerManager } from '../manager/bpartnerManager';
import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import agreementRepository, { AgreementRepository } from '../db/repository/agreementRepository';
import { POIManager } from '../manager/poiManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { deserialize, serialize } from '../json';
import * as AWS from 'aws-sdk';
import { Agreement } from '../models/tours/agreement';
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
interface helpObjectSort {
	from: string;
	count: number;
  };

export class ReportManager {
	bookingRepository: BookingRepository;
	agreementRepository: AgreementRepository;
	tourRepository: TourRepository;
	poiManager: POIManager;
	bpartnerManager: BPartnerManager;


	constructor() {
		this.bookingRepository = bookingRepository;
		this.agreementRepository = agreementRepository;
		this.tourRepository = tourRepository;
		this.poiManager = new POIManager();
		this.bpartnerManager = new BPartnerManager();

	}

	async getReport(companyId: string, filter: any, pagination?: any): Promise<Report> {
		try{
		const bookings: Booking[] = await this.bookingRepository.getAll(filter, pagination).catch(() => {
	
			throw new Error('Error getting bookings');
		});

		
		const p: POI = await this.poiManager.getPoi(companyId).catch(() => {
			throw new Error('Error getting poi');
		});

		console.log(p.bpartnerId)
		const bPartner: BPartner = await this.bpartnerManager.getBP(p.bpartnerId).catch(() => {
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
		report.name = p.name['english'];
		report.bpartnerName = bPartner.name;
		report.bpartnerEmail = bPartner.contact.email;
		report.bpratnerPhone = bPartner.contact.phone;
		report.bpratnerPhone2 = bPartner.contact.phone2;
		report.offerName = p.offerName;
		report.menu = p.menu

		return report
	}catch(err){
		console.log(err)
	}
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
		try{
		/*QRCode.toDataURL("http://localhost:3000/#/report/"+ companyId,{scale: 15,
		width: "1000px"}, function (err, base64) {
			
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
		});*/

		await QRCode.toFile(companyId.trim() + ".png", "https://hopguides-web-client-main-j7limbsbmq-oc.a.run.app/#/report/" + companyId.trim(),  {
			width:  600,
			height:  600
		   },function (err) {

		//return false
		})
		return true
	}catch{
		return false
	}
	}


	async createAgreement(agreement: Agreement): Promise<Agreement> {
		
		return await this.agreementRepository.createOne(agreement).catch((err) => {
		  console.log(err)
		  throw new CustomError(500, 'Agreement not created!');
		});
	  }
	


	
	  async getAgreements(): Promise<Agreement[]> {

		
		return await this.agreementRepository.getAll().catch(() => {
			throw new Error('Error getting agreements');
		});


	}


	

}