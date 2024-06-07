import { IRequest, IResponse } from '../classes/interfaces';
import { withErrorHandler } from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
import { ReportManager } from '../manager/reportManager';
import { TourManager } from '../manager/tourManager';
import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import { POI } from '../models/tours/poiModel';
import { POIManager } from '../manager/poiManager';
const { createInvoice } = require("../classes/createInvoice");
import * as sgMail from '@sendgrid/mail';
import * as schedule from 'node-schedule';
const path = require('path');
import { simpleAsync } from './util';
import axios from 'axios';
const { PDFDocument } = require('pdf-lib');

const { convert } = require('pdf-poppler');
import * as multer from 'multer';
import { Agreement } from '../models/tours/agreement';

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
interface helpObjectSort {
	from: string;
	count: number;
};
var s3 = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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"
})


const uploadPDFToS3 = ( key, pdfBuffer) => {
    const params = {
        Bucket: "hopguides/agreements",
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
    };

    return s3.upload(params).promise();
};

sgMail.setApiKey("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")
var emailSender = "beta-app@gogiro.app";

export class ReportRouter extends BaseRouter {
	reportManager: ReportManager;
	tourManager: TourManager;
	poiManager: POIManager;
	upload: multer.Multer;

	fileFilter = (req, file, cb) => {

		if (file.originalname.match(/\.(pdf)$/)) {
			cb(null, true);
		} else {
			cb(null, false);
		}
	}

	constructor() {
		super(true);
		this.reportManager = new ReportManager();
		this.tourManager = new TourManager();
		this.poiManager = new POIManager();
		this.upload = multer({
			storage: multer.diskStorage({
				destination: function (req, file, cb) {
					cb(null, 'uploads/');
				},
				filename: function (req, file, cb) {

					cb(null, file.fieldname);
				}
			}),
			fileFilter: this.fileFilter
		});
		this.init();
	}


	init(): void {
		/** GET report for one company/point  */
		this.router.get(
			'/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					const filter: any = {};
					const report: Report = await this.reportManager.getReport(req.params.id, filter);
					return res.status(200).send(report)
				} catch (err) {
					return res.status(412).send(err)
				}
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

		this.router.get(
			'/agreements/all',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const agreements: Agreement[] = await this.reportManager.getAgreements();
				return res.status(200).send(agreements)
			})
		);


		async function convertPdfPageToImage(pdfPath, outputPath) {
			let opts = {
				format: 'jpeg',
				out_dir: path.dirname(outputPath),
				out_prefix: path.basename(outputPath, path.extenum),
				page: 1
			};
			await convert(pdfPath, opts);
			return path.join(__dirname, '../templates/' + opts.out_prefix + '-1.jpg');
		}


		this.router.post(
			'/agreements/create',
			this.upload.fields([
				{ name: 'basicOffer', maxCount: 1 },
				{ name: 'standardOffer', maxCount: 1 },
				{ name: 'premiumOffer', maxCount: 1 }
			]),
			withErrorHandler(async (req, res) => {

				try {
					const data = req.body;
					var templatePath = ""
					var placeholders = {}
					
					if (req.body.category == "experience" && req.body.language == "English") {
						templatePath = path.join(__dirname, '../templates/Test.pdf');
						placeholders = {
							basicOffer: { page: 4, x: 50, y: 270, width: 400, height: 500 },
							standardOffer: { page: 5, x: 50, y: 275, width: 400, height: 500 },
							premiumOffer: { page: 6, x: 50, y: 280, width: 400, height: 500 }
						};
					}else if(req.body.category == "experience" && req.body.language == "Slovenian"){
						templatePath = path.join(__dirname, '../templates/Test_SLO.pdf');
						placeholders = {
							basicOffer: { page: 4, x: 50, y: 250, width: 400, height: 500 },
							standardOffer: { page: 5, x: 50, y: 250, width: 400, height: 500 },
							premiumOffer: { page: 6, x: 50, y: 250, width: 400, height: 500 }
						};
					}else if(req.body.category == "general" && req.body.language == "English"){
						templatePath = path.join(__dirname, '../templates/Test_general.pdf');
						placeholders = {
							basicOffer: { page: 4, x: 50, y: 255, width: 400, height: 500 },
							standardOffer: { page: 5, x: 50, y: 240, width: 400, height: 500 },
							premiumOffer: { page: 6, x: 50, y: 270, width: 400, height: 480 }
						};
					}else if(req.body.category == "general" && req.body.language == "Slovenian"){
						templatePath = path.join(__dirname, '../templates/Test_SLO_general.pdf');
						placeholders = {
							basicOffer: { page: 4, x: 50, y: 255, width: 400, height: 500 },
							standardOffer: { page: 5, x: 50, y: 240, width: 400, height: 500 },
							premiumOffer: { page: 6, x: 50, y: 270, width: 400, height: 480 }
						};
					}
					// Path to the stored PDF template on your server
					const templateBytes = fs.readFileSync(templatePath);
					const pdfDoc = await PDFDocument.load(templateBytes);

					// Get the form from the template and fill it
					const form = pdfDoc.getForm();
					form.getTextField('addressee').setText(data.name_of_addressee);
					form.getTextField('offer_number').setText(data.offer_number);
					form.getTextField('date').setText(data.date);

					form.getTextField('addressee').enableReadOnly();
					form.getTextField('offer_number').enableReadOnly();
					form.getTextField('date').enableReadOnly();

					//form.flatten(); // Optional: Flatten the form to prevent further edits
					const fileFields = ['basicOffer', 'standardOffer', 'premiumOffer'];
					

					for (const fieldName of fileFields) {
						if (req.files[fieldName] && req.files[fieldName].length > 0) {
							const uploadedFile = req.files[fieldName][0];
							const imagePath = await convertPdfPageToImage(uploadedFile.path, path.join(__dirname, '../templates', fieldName));

							const imageBytes = fs.readFileSync(imagePath);
							const image = await pdfDoc.embedJpg(imageBytes);
							const pageInfo = placeholders[fieldName];
							const page = pdfDoc.getPages()[pageInfo.page];

							page.drawImage(image, {
								x: placeholders[fieldName].x,
								y: page.getHeight() - pageInfo.y - pageInfo.height,
								width: placeholders[fieldName].width,
								height: placeholders[fieldName].height
							});

							fs.unlinkSync(uploadedFile.path); // Clean up uploaded file
							fs.unlinkSync(imagePath); // Clean up converted image
						}
					}


					const pdfBytes = await pdfDoc.save();

				


					const key = `${req.body.offer_number}_agreement.pdf`;
		
					await uploadPDFToS3(key, pdfBytes);
		
					var agreement = new Agreement();
					agreement.addressee = req.body.addressee;
					agreement.category = req.body.category;
					agreement.email = req.body.email;
					agreement.language = req.body.language;
					agreement.offer_number = req.body.offer_number;
					agreement.link = "https://hopguides.s3.eu-central-1.amazonaws.com/agreements/" + key

					await this.reportManager.createAgreement(agreement);

					fs.writeFileSync('final_output.pdf', pdfBytes);
					res.setHeader('Content-Type', 'application/pdf');
					res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
					res.send(Buffer.from(pdfBytes));
				} catch (error) {
					console.error(error);
					res.status(500).send('Failed to create PDF');
				}
			})
		);
		this.router.post(
			'/instantly',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req, res) => {
				//console.log(req.body.campaign_name)
				//console.log(req.body.email)

				var data = {
					'campaign_name': req.body.campaign_name,
					'email': req.body.email

				}

				try {

					await axios.post('https://hooks.zapier.com/hooks/catch/16883860/3pd2lnc/', data)
						.then(response => {
							console.log(response.data);
						})
						.catch(error => {
							console.log(error);
						});



				} catch (error) {
					console.error('Error:', error);
				}


			})
		);

		this.router.post(
			'/instantly_english',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req, res) => {
				//console.log(req.body.campaign_name)
				//console.log(req.body.email)

				var data = {
					'campaign_name': req.body.campaign_name,
					'email': req.body.email

				}

				try {

					await axios.post('https://hooks.zapier.com/hooks/catch/16883860/3pd6n4s/', data)
						.then(response => {
							console.log(response.data);
						})
						.catch(error => {
							console.log(error);
						});



				} catch (error) {
					console.error('Error:', error);
				}


			})
		);

		/** GET generate qr code for company  */
		this.router.get(
			'/qr/:id',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {


				try {

					/*var tf = false;
					tf = await this.reportManager.generateQr(req.params.id);

					if(tf){

						return res.status(200).send("Success")
					}else{
						
				return res.status(500).send("Failure")
					}*/

					var tf = false;
					tf = await this.reportManager.generateQr(req.params.id);


					await sleep(1000);

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



			})
		);


		/** GET send invoice email  */
		this.router.get(
			'/emails/sendEmails',
			//allowFor([AdminRole, SupportRole, ServiceRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				//const job = schedule.scheduleJob('0 0 1 * *', async function () {
				//const job = schedule.scheduleJob('45 * * * *',  async function () {


				var pois: POI[] = await this.poiManager.getPois()
				for (var poi of pois) {

					var report: Report = await this.reportManager.getReport(poi.id, {})
					//var help: string[] = poi.price.toString().split("€")
					var price = 1 * Number(poi.price);
					price = Math.round(price * 100) / 100;


					const invoice = {
						shipping: {
							name: "Tourism Ljubljana",
							address: "1234 Main Street",
							city: "Ljubljana",
							country: "Slovenia",
							postal_code: 1000
						},
						items: [
							{
								name: report.name,
								offerName: report.offerName,
								monthlyUsedCoupons: 1,
								price: poi.price
							},

						],
						subtotal: price,
						paid: 0,
						invoice_nr: 1234
					};

					const pdfBuffer = await createInvoice(invoice, "invoice.pdf");
					const pdfBase64string = pdfBuffer.toString('base64')


					sgMail.send({
						to: "lunazivkovic@gmail.com", // change so that poi.contact.email gets email
						from: `${emailSender}`,
						subject: "Monthly invoice to Tourism Ljubljana",
						html: `Dear partner,<br/><br/>
						
						Please invoice Tourism Ljubljana 15eur with tax until the 15th of this month.<br/>
						Attached, you will find invoice report pdf document.<br/><br/>
						
						For more information, please visit` + " <a href=http://localhost:3001/#/report/" + poi.id + ">this website</a><br/><br/>Kind regards, <br/> GoGiro.",
						attachments: [
							{
								content: pdfBase64string,
								filename: "attachment.pdf",
								type: "application/pdf",
								disposition: "attachment"
							}
						]
					})


				}

				//});
				return res.status(200)
			})
		);

	}
}