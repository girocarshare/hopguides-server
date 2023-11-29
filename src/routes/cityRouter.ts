import { IRequest, IResponse } from '../classes/interfaces';
import { withErrorHandler } from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { Report } from '../models/report/report';
import { CityManager } from '../manager/cityManager';
import { TourManager } from '../manager/tourManager';
import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import { simpleAsync } from './util';
import * as multer from 'multer';
var multerS3 = require('multer-s3');
import { POI } from '../models/tours/poiModel';
import { POIManager } from '../manager/poiManager';
const axios = require('axios');
const { createInvoice } = require("../classes/createInvoice");
//import qs from 'qs';
import * as sgMail from '@sendgrid/mail';
const qs = require('qs');
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})
const path = require('path');
interface IBkRequest extends IRequest {
	str: string
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
sgMail.setApiKey("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")
var emailSender = "beta-app@gogiro.app";


async function getCity(token, city) {

	return await axios.get("https://api.amadeus-discover.com/api/consumer/products?search=taxonomy%3Aactivities-culture-tickets-passes%20OR%20taxonomy%3Aactivities-food-drink-restaurants-bars%20OR%20taxonomy%3Aactivities-no-category%20OR%20taxonomy%3Aactivities-food-drink-tickets-passes%20OR%20taxonomy%3Aactivities-action-entertainment-tickets-passes%20AND%20city%3A" + city, {
		headers: {
			'Authorization': 'Bearer ' + token,
			//'Content-Type': 'application/json'
		}
	})
		.then(async response => {
			console.log(response.data.items)

			return response



		})
		.catch(error => {

			console.log("error " + error)

		});


	//return res.status(200).send(response)



}

export class CityRouter extends BaseRouter {
	cityManager: CityManager;
	fileFilter = (req, file, cb) => {
		if (file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3|mp4|PNG)$/)) {
			cb(null, true)
		} else {
			cb(null, false)
		}
	}

	multerS3Config = multerS3({
		s3: s3,
		bucket: 'hopguides/d-id',
		acl: 'public-read',
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
		this.cityManager = new CityManager();
		this.upload = multer({
			storage: this.multerS3Config,
			fileFilter: this.fileFilter,

		});
		this.init();
	}

	init(): void {
		/** GET report for one company/point  */
		this.router.get(
			'/:city',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					var resp = []
					const data = {
						client_id: 'consumer-api',
						grant_type: 'password',
						username: 'klemenfurlan',
						password: 'Giro1234!'
					};

					if (req.params.city.toLowerCase() === 'ljubljana') {
						setTimeout(async () => {

							axios.get("https://hopguides.s3.eu-central-1.amazonaws.com/amadeus/ljubljana.txt")
								.then(response => {
									console.log(response.data);
									res.status(200).send(response.data);
								})
								.catch(error => {
									console.error('Error:', error);
								});


						}, 1000);  // Wait for 3 seconds before reading the file
					} else if (req.params.city.toLowerCase() === 'tel aviv') {
						setTimeout(async () => {
							axios.get("https://hopguides.s3.eu-central-1.amazonaws.com/amadeus/telaviv.txt")
								.then(response => {
									console.log(response.data);
									res.status(200).send(response.data);
								})
								.catch(error => {
									console.error('Error:', error);
								});

						}, 1000);  // Wait for 3 seconds before reading the file
					} else {



						await axios.post("https://api.amadeus-discover.com/auth/realms/amadeus-discover/protocol/openid-connect/token", qs.stringify(data), {
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',

								//'Content-Type': 'application/json'
							}
						})
							.then(async response => {
								console.log(response.data.access_token)
								var respons = await getCity(response.data.access_token, req.params.city)

								console.log("RESPONSEEE" + respons)
								res.status(200).send(respons.data.items);



							})
							.catch(error => {

								console.log("error " + error)
								return res.status(402).send({ message: "You do not have enough tokens in d-id" });
							});
					}

					//return res.status(200).send(response)
				} catch (err) {
					return res.status(412).send(err)
				}
			})

		);



		this.router.post(
			'/upload',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//this.upload.array('file'),
			this.upload.single('file'),
			simpleAsync(async (req: IBkRequest, res: IResponse) => {
				// Upload
				try {


					console.log("REQUEST")
					console.log(req.file.location)

					return res.status(200).send(req.file.location);

				} catch (err) {
					console.log(err.error)
				}

			})
		);

	}
}