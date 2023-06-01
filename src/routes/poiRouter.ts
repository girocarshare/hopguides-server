
import { IRequest, IResponse } from '../classes/interfaces';
import { Obj, POIManager } from '../manager/poiManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import { BaseRouter } from './baseRouter';
import { UserManager } from '../manager/userManager';
import {
	parseJwt,
	withErrorHandler
} from '../utils/utils';
import { POI } from '../models/tours/poiModel';
import { BPartner } from '../models/bpartner/bpartner';
import { deserialize, serialize } from '../json';
import { CustomError } from '../classes/customError';
import * as multer from 'multer';
import * as fs from 'fs';
import { simpleAsync } from './util';
import { ToursReport } from '../classes/tour/toursReport';
import { TourManager } from '../manager/tourManager';

import { ToursWithPoints } from '../classes/tour/toursWithPoints';

import * as AWS from 'aws-sdk';
import { LocalizedField } from '../models/localizedField';
import { Tour } from '../models/tours/tour';
var multerS3 = require('multer-s3');
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})

export class HelpObj {
	number: string
	name: LocalizedField
}

var rString: string;
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

interface IBkRequest extends IRequest {
	point: POI;
	pointId: string;
}

export class POIRouter extends BaseRouter {
	poiManager: POIManager;
	bpartnerManager: BPartnerManager;
	tourManager: TourManager;
	userManager: UserManager;

	fileFilter = (req, file, cb) => {
		if (file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3|mp4)$/)) {
			cb(null, true)
		} else {
			cb(null, false)
		}
	}


	multerS3Config = multerS3({
		s3: s3,
		bucket: 'hopguides/menu',
		metadata: function (req, file, cb) {

			cb(null, { fieldName: globalThis.rString });
		},
		key: function (req, file, cb) {
			var list = file.originalname.split('.')
			globalThis.rString = randomstring(10) + "." + list[list.length - 1]
			cb(null, globalThis.rString)
		}
	});

	upload = multer({
		storage: this.multerS3Config,
		fileFilter: this.fileFilter,



	})

	constructor() {
		super(true);
		this.poiManager = new POIManager();
		this.bpartnerManager = new BPartnerManager();
		this.tourManager = new TourManager();
		this.userManager = new UserManager();
		this.upload = multer({
			storage: this.multerS3Config,
			fileFilter: this.fileFilter,

		});
		this.init();
	}

	init(): void {

		/** GET all poi */
		this.router.get(
			'/all',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				try {

					return res.status(412).send(await this.poiManager.getPois());
				} catch (err) {
					return res.status(412).send("Error while getting pois");
				}


			})
		);

		this.router.post(
			'/:pointId/uploadMenu',
			//userSecurity(),
			//ownedBookingInStatusMdw(RentStatus.DRIVING),
			this.upload.single('file'),
			simpleAsync(async (req: IBkRequest) => {
				// Upload
				if (!req.file) console.log("Error while uploading file")


				return await this.poiManager.uploadMenu(req.params.pointId, req.file.location);
			})
		);


		/** POST update poi */
		this.router.post(
			'/update',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			parseJwt,
			this.upload.array('file'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				try {

					
					let jsonObj = JSON.parse(req.body.point);
					let point = jsonObj as POI;
					var arrayy = []

					var tour = null;
					var tours : Tour[] = await this.tourManager.getTours();

					for(var t of tours){
						for(var poi of t.points){
							if(point.id == poi){
								tour = t
							}
						}
					}
					
					var user = await this.userManager.getUser(req.userId)
					var poiPrevious = await this.poiManager.getPoiByPreviousId(point.id)


					if (poiPrevious != null) {
						if (user.role == "ADMIN") {
							return res.status(412).send("Poi already updated by partner");
						}

						const updatedPoi: POI = await this.poiManager.updatePoi(
							poiPrevious.id,
							point
						);
						console.log("FAJ::::LLL")
						console.log(req.files)
						for (var f of req.files) {
	
							if (f.originalname.substring(0, 6).trim() === 'audio2') {
	
								await this.poiManager.uploadAudio(point.id, f.location);
	
							}
							if (f.originalname.substring(0, 4).trim() === 'menu') {
	
								console.log(point.id + f.location)
								await this.poiManager.uploadMenu(point.id, f.location);
	
							}
	
							if (f.originalname.substring(1, 8).trim() === 'partner') {
	
								console.log("FAJ::::LLL")
								console.log(f)
								arrayy.push(f.location);
							}
						}
	
						if(point.imageTitles !=null){
						var obj: Obj = new Obj();
	
						obj.names = point.imageTitles
						obj.paths = arrayy
						await this.poiManager.uploadImages(poiPrevious.id, obj);
						}
						//const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints();
	

					
						//return res.status(200).send([]);


					}else{
					
					if(user.role == "PROVIDER"){
						const poi: POI = await this.poiManager.getPoi(point.id);
						poi.previousId = poi.id
						const poiUpdated: POI = await this.poiManager.createPOI(deserialize(POI, poi));
						const updatedPoi: POI = await this.poiManager.updatePoi(
							poiUpdated.id,
							point
						);
	
						for (var f of req.files) {
	
							if (f.originalname.substring(0, 6).trim() === 'audio2') {
	
								await this.poiManager.uploadAudio(point.id, f.location);
	
							}
							if (f.originalname.substring(0, 4).trim() === 'menu') {
	
								console.log(point.id + f.location)
								await this.poiManager.uploadMenu(point.id, f.location);
	
							}
	
							if (f.originalname.substring(1, 8).trim() === 'partner') {
								console.log("FAJ::::LLL")
								console.log(f)
								arrayy.push(f.location);
							}
						}
	
						if(point.imageTitles !=null){
						var obj: Obj = new Obj();
	
						obj.names = point.imageTitles
						obj.paths = arrayy
						await this.poiManager.uploadImages(poiUpdated.id, obj);
						}
						//const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints();
	

						var points = []
						for(var p of tour.points){
							if(p == point.id){

							}else{
								points.push(p)
							}
						}

						points.push(poiUpdated.id)
						tour.points = points
						tour.previousId = tour.id
						tour.update = true;
						var t = await this.tourManager.createTour(
							deserialize(Tour, tour)
						);
						await this.tourManager.updateTour(
							t.id,
							tour
						);
						
						return res.status(200).send([]);
					}else if(user.role == "ADMIN"){


					const updatedPoi: POI = await this.poiManager.updatePoi(
						point.id,
						point
					);
					console.log("FAJ::::LLLddddd")
					console.log(req.files)
					for (var f of req.files) {

						if (f.originalname.substring(0, 6).trim() === 'audio2') {

							await this.poiManager.uploadAudio(point.id, f.location);

						}
						if (f.originalname.substring(0, 4).trim() === 'menu') {

							console.log(point.id + f.location)
							await this.poiManager.uploadMenu(point.id, f.location);

						}

						if (f.originalname.substring(1, 8).trim() === 'partner') {
							console.log("FAJ::::LLL")
							console.log(f)
							arrayy.push(f.location);
						}
					}

					if(point.imageTitles.length !=0){
					var obj: Obj = new Obj();

					obj.names = point.imageTitles
					obj.paths = arrayy
					await this.poiManager.uploadImages(point.id, obj);
					}
					//const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints();

					//return res.status(200).send([]);
				}
			}
				} catch (err) {
					console.log(err)
				}
			})
		);


	}
}