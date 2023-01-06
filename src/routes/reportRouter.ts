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
/*import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { SearchReportFilter } from '../classes/searchReportFilter';*/
import * as multer from 'multer';
/*import { NotificationManager } from '../manager/notificationManager';
import { ReportType } from '../models/report/enums';
import { Vehicle } from '../models/car/car';*/

import { simpleAsync } from './util';
interface IBkRequest extends IRequest {
	tour: Tour;
	tourId: string;
}	

function randomstring(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	return result;
}
export class ReportRouter extends BaseRouter {
	//carManager: CarManager;
	reportManager: ReportManager;
	tourManager: TourManager;
	//userManager: UserManager;
	//notificationManager: NotificationManager;
	//upload: any;

	
	storage = multer.diskStorage({
		destination: function (req, file, cb) {
			
		console.log("evo me ovde")
			cb(null, 'images/menu')
		},
		filename: function (req, file, cb) {
			
		console.log("evo me ovde 2222")
		globalThis.randomString = randomstring(10)
			var list = file.originalname.split('.')
			cb(null, globalThis.randomString + "." + list[list.length - 1]);
		},
	
		fileFilter(req, file, cb) {
			if (!file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt)$/)) {
				return cb(new Error('Please upload pdf file.'))
			}
			cb(undefined, true)
		}
	})
	
	upload = multer({ storage: this.storage })
	constructor() {
		super(true);
		this.upload = multer({ storage: this.storage });
		//this.carManager = new CarManager();
		//this.userManager = new UserManager();
		this.reportManager = new ReportManager();
		this.tourManager = new TourManager();
		//this.notificationManager = new NotificationManager();

		this.init();
	}

	init(): void {
		/** GET the list of reports   */
		this.router.get(
			'/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const filter: any = {};
				const report: Report = await this.reportManager.getReport(req.params.id, filter);
				return res.status(200).send(report)
			})
		);

		/** GET generate qr code for company   */
		this.router.get(
			'/qr/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
	
				 await this.reportManager.generateQr(req.params.id);
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

		this.router.post(
			'/:pointId/uploadMenu',
			//userSecurity(),
			//ownedBookingInStatusMdw(RentStatus.DRIVING),
			this.upload.single('file'),
			simpleAsync(async (req: IBkRequest) => {
				// Upload
				console.log(req.file)
				if (!req.file) console.log("Error while uploading file")
				return await this.tourManager.uploadMenu(req.params.pointId, req.file);
			})
		);


		
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
