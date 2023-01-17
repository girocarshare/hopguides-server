/*import { ServiceRole } from './../utils/utils';*/
import { IRequest, IResponse } from '../classes/interfaces';
/*import { CarManager } from '../manager/carManager';
import { User } from '../models/user/user';
import { UserManager } from '../manager/userManager';*/
import { /*AdminRole, allowFor, parseJwt, SupportRole,*/ withErrorHandler } from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
//import { deserialize, serialize } from '../json';*/
import { ReportManager } from '../manager/reportManager';
import { TourManager } from '../manager/tourManager';
import { CustomError } from '../classes/customError';
/*import { SearchPagination } from '../classes/searchPagination';
import { SearchReportFilter } from '../classes/searchReportFilter';*/
import { NotificationType } from '../models/notification/notificationType';
/*import { ReportType } from '../models/report/enums';
import { Vehicle } from '../models/car/car';*/
import * as fs from 'fs';
import { POI } from '../models/tours/poi';
import { POIManager } from '../manager/poiManager';

import { Notification } from '../models/notification/notification';

import * as sgMail from '@sendgrid/mail';

import { simpleAsync } from './util';

interface helpObjectSort {
	from: string;
	count: number;
};


sgMail.setApiKey("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")
var emailSender = "beta-app@gogiro.app";


export class ReportRouter extends BaseRouter {
	//carManager: CarManager;
	reportManager: ReportManager;
	tourManager: TourManager;
	poiManager: POIManager;
	//userManager: UserManager;
	//notificationManager: NotificationManager;
	//upload: any;

	

	constructor() {
		super(true);
		//this.carManager = new CarManager();
		//this.userManager = new UserManager();
		this.reportManager = new ReportManager();
		this.tourManager = new TourManager();
		this.poiManager = new POIManager();
		//this.notificationManager = new NotificationManager();

		this.init();
	}

	init(): void {
		/** GET report for one company/point  */
		this.router.get(
			'/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const filter: any = {};
				const report: Report = await this.reportManager.getReport(req.params.id, filter);
				return res.status(200).send(report)
			})
		);

		this.router.get(
			'/previous/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const filter: any = {};
				const helpObjectS: helpObjectSort[] = await this.reportManager.getReports(req.params.id, filter);
				return res.status(200).send(helpObjectS)
			})
		);

		/** GET generate qr code for company   */
		this.router.get(
			'/qr/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {


				try {

					var tf = false;
					tf = await this.reportManager.generateQr(req.params.id);



					if (tf) {
						fs.readFile("./" + req.params.id.trim() + ".png", (error, data) => {
							if (error) {
								throw error;
							}
							var file = data

							var filename = req.params.id.trim() + ".png"
							res.status(200);
							res.setHeader('Content-Type', 'application/octet-stream');
							res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
							res.write(file, 'binary');
							res.end();

						});
					}

				} catch (err) {
					console.log(err.error)
				}


				return res.status(200)

			})
		);

		
		/** GET send invoice email  */
		this.router.get(
			'/emails/sendEmails',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				

				var pois : POI[] = await this.poiManager.getPois()
				for(var poi of pois){

					var report: Report = await this.reportManager.getReport(poi.id, {})
					var price = report.monthlyUsedCoupons * poi.price;
					sgMail.send({
						to: "lunazivkovic@gmail.com", // change so that poi.contact.email gets email
						from: `${emailSender}`,
						subject: "Monthly invoice to Tourism Ljubljana",
						text: `Please invoice Tourism Ljubljana for ${price} eur with tax`,
					})

				}
				

				return res.status(200)
			})
		);
		/*this.router.post(
			'/:tourId/uploadFile',
			//userSecurity(),
			//ownedBookingInStatusMdw(RentStatus.DRIVING),
			this.upload.single('file'),
			simpleAsync(async (req: IBkRequest) => {
				// Upload
				console.log(req.tourId)
				if (!req.file) console.log("Error while uploading file")
				return await this.tourManager.__uploadFile(req.params.tourId, req.file);
			})
		);*/



		/** POST report   
		this.router.post(
			'/',
			allowFor([AdminRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				// Parse body
				const reportData: Report = deserialize(Report, req.body);
				if (reportData.type !== ReportType.SERVICE) {
					throw new CustomError(404, 'Report type not found');
				}

				let vehicle: Vehicle;
				if (req.body.vehicleId) {
					vehicle = await this.carManager.getVehicleByIMEIServicers(req.body.vehicleId);
					reportData.vehicle = vehicle;
					if (!vehicle) {
						throw new CustomError(404, 'Vehicle not found');
					}
				}
				reportData.userId = req.userId;

				// Create report
				const createdReport = await this.reportManager.createReport(reportData);
				if (!createdReport) throw new CustomError(500, 'Unable to create report');
				if (reportData.type !== ReportType.SERVICE) {
					await this.notificationManager.reportToResolve(createdReport, vehicle);
				}
				return !!createdReport;
			})
		);

		/**
		 * GET number of all reports
		   
		this.router.get(
			'/count',
			allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const count: number = await this.reportManager.countReports();
				return res.respond(200, count);
			})
		);

		/** GET fetches report data   
		this.router.get(
			'/:reportId',
			allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const report: Report = await this.reportManager.getReport(req.params.reportId);
				return res.respond(200, report);
			})
		);

		/** PATCH patches report from support panel   
		this.router.patch(
			'/:reportId',
			allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const user: User = await this.userManager.getUser(req.userId);
				if (!user) return res.throwErr(new CustomError(404, 'User not found'));
				const report: Report = await this.reportManager.getReport(req.params.reportId);
				if (!report) return res.throwErr(new CustomError(404, 'Report not found'));

				const reportData: Report = deserialize(Report, req.body);

				const patchedReport: Report = await this.reportManager.patchReport(
					user,
					report.id,
					reportData
				);

				return res.respond(200, patchedReport);
			})
		);

		/** POST report   
		this.router.post(
			'/:reportId/resolve',
			allowFor([AdminRole, SupportRole, ServiceRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const user: User = await this.userManager.getUser(req.userId);
				if (!user) return res.throwErr(new CustomError(404, 'User not found'));
				const report: Report = await this.reportManager.getReport(req.params.reportId);
				if (!report) return res.throwErr(new CustomError(404, 'Report not found'));

				const reportData: Report = deserialize(Report, req.body);

				const resolvedReport: Report = await this.reportManager.resolveReport(
					user,
					report.id,
					reportData
				);

				return res.respond(200, resolvedReport);
			})
		);*/
	}
}
