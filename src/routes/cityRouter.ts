import { IRequest, IResponse } from '../classes/interfaces';
import {  withErrorHandler } from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { Report } from '../models/report/report';
import { CityManager } from '../manager/cityManager';
import { TourManager } from '../manager/tourManager';
import * as fs from 'fs';
import { POI } from '../models/tours/poiModel';
import { POIManager } from '../manager/poiManager';
const axios = require('axios');
const { createInvoice } = require("../classes/createInvoice");
//import qs from 'qs';
import * as sgMail from '@sendgrid/mail';
const qs = require('qs');
function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  }
interface helpObjectSort {
	from: string;
	count: number;
};


sgMail.setApiKey("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")
var emailSender = "beta-app@gogiro.app";


async function getCity(token, city) {

	return await axios.get("https://api.amadeus-discover.com/api/consumer/products?search=city%3A"+city+"&resultsPerPage=100&pageNumber=1&sortingOrder=asc", {
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

	constructor() {
		super(true);
		this.cityManager = new CityManager();
		this.init();
	}

	init(): void {
		/** GET report for one company/point  */
		this.router.get(
			'/:city',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try{
			var resp = []
			const data = {
				client_id: 'consumer-api',
				grant_type: 'password',
				username: 'klemenfurlan',
				password: 'Giro1234!'
			};
			await axios.post("https://api.amadeus-discover.com/auth/realms/amadeus-discover/protocol/openid-connect/token",  qs.stringify(data), {
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


				//return res.status(200).send(response)
				}catch(err){
					return res.status(412).send(err)
				}
			})
		);
	
	}
}