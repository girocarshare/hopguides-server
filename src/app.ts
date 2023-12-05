import * as express from 'express';
import { UserRouter } from './routes/userRouter';
import { VehicleRouter } from './routes/vehicleRouter';
import { BookingRouter } from './routes/bookingRouter';
import { ReportRouter } from './routes/reportRouter';
import { POIRouter } from './routes/poiRouter';
import { TourManager } from './manager/tourManager';
var deeplink = require('node-deeplink');
import { DashboardAppRouter } from './routes/dash/router';
import { BPartnerRouter } from './routes/bpartnerRouter';
import { CityRouter } from './routes/cityRouter';
import { User } from './models/user/user';
import * as AWS from 'aws-sdk';
import { UserManager } from './manager/userManager';
const stripe = require('stripe')('sk_test_51MAy4gDmqfM7SoUzbMp9mpkECiaBifYevUo2rneRcI4o2jnF11HeY1yC5F1fiUApKjDIkkMUidTgmgStWvbyKLvx00Uvoij5vH');
const endpointSecret = "whsec_udE8WsgMxTywVI44nhBJtjoGuZzqB2Ce";
//global.CronJob = require('./db/cron.js');

var QRCode = require('qrcode')
const client = require('@sendgrid/client');
client.setApiKey("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");

import sgMail = require('@sendgrid/mail');
import { QRCodes } from './models/qrcodes/qrcodes';
sgMail.setApiKey("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")
var emailSender = "luna.zivkovic@gogiro.app";

const s3bucket = new AWS.S3({
	accessKeyId: "AKIATMWXSVRDIIFSRWP2",
	secretAccessKey: "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",
	params: { Bucket: 'hopguides/qrcodes' }
});

class App {

	public app: express.Application;

	private userRouter: UserRouter;
	private cityRouter: CityRouter;
	private vehicleRouter: VehicleRouter;
	private bookingRouter: BookingRouter;
	private bpartnerRouter: BPartnerRouter;
	private reportRouter: ReportRouter;
	private poiRouter: POIRouter;
	tourManager: TourManager;
	public userManager: UserManager;

	constructor() {
		this.app = express();
		this.userRouter = new UserRouter();
		this.cityRouter = new CityRouter();
		this.tourManager = new TourManager();
		this.userManager = new UserManager();
		this.vehicleRouter = new VehicleRouter();
		this.bookingRouter = new BookingRouter();
		this.bpartnerRouter = new BPartnerRouter();
		this.reportRouter = new ReportRouter();
		this.poiRouter = new POIRouter();
		this.config();
	}


	config(): void {
		this.app.set('trust proxy', true);
		this.app.use(function (req: any, res: any, next: any) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
			res.header(
				'Access-Control-Allow-Headers',
				'Origin, X-Requested-With, Content-Type, Accept, accessToken, Accept-Language, Authorization'
			);
			res.header('Access-Control-Expose-Headers', 'Authorization');
			// intercepts OPTIONS method
			if (req.method === 'OPTIONS') {
				// respond with 200
				res.sendStatus(200);
			} else {
				// move on
				next();
			}
		});

		// morgan ~ Enable logger if required
		if (process.env.ENV === 'dev') {
			this.app.use(require('morgan')('dev'));
		}
		function isEmpty(obj: object): boolean {
			return Object.keys(obj).length === 0 && obj.constructor === Object;
		}
		this.app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
			let event;

			console.log("USLA U WEBHOOKKKKKKKK11111111111")
			try {
				event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], endpointSecret);
			} catch (err) {
				console.log(`⚠️  Webhook signature verification failed. Check the logs to see the exact error message.`);
				return res.sendStatus(400);
			}

			if (event.type === 'invoice.paid') {
				const invoice = event.data.object;
				const amountPaid = invoice.amount_paid;
				console.log("Amount Paid: ", amountPaid / 100);
				// Access subscription details and metadata
				const subscriptionDetails = invoice.subscription_details;
				const metadata = subscriptionDetails ? subscriptionDetails.metadata : null;

				if (metadata) {
					const storeItems = new Map([
						[1, { priceInCents: 2999, name: "Basic plan monthly" }],
						[2, { priceInCents: 12900, name: "Premium plan monthly" }],
						[3, { priceInCents: 22800, name: "Base plan yearly" }],
						[4, { priceInCents: 118800, name: "Premium plan yearly" }],
						[5, { priceInCents: 7000, name: "Influencer package" }],
					])

					console.log("Received metadata: ", metadata);
					let user: User = await this.userManager.getUser(metadata.userId);

					if (amountPaid == 2999) {

						user.tokens = user.tokens + 100
					} else if (amountPaid == 12900) {
						user.tokens = user.tokens + 500
					} else if (amountPaid == 22800) {

						user.tokens = user.tokens + 1200
					} else if (amountPaid == 118800) {

						user.tokens = user.tokens + 6000
					} else {

						user.tokens = user.tokens + 300
					}


					await this.userManager.updateUser(user.id, user)


					console.log("Received metadata: ", metadata);  // Log it for debugging
					// Your logic here
				}
			}


			// Return a response to acknowledge receipt of the event
			res.json({ received: true });
		});

		this.app.post('/webhooktour', express.raw({ type: 'application/json' }), async (req, res) => {
			let event;

			try {
				event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], "whsec_QcbPPFex4zcyqIQWBX7JVuEdd3MVhOPy");
			} catch (err) {
				console.log(`⚠️  Webhook signature verification failed. Check the logs to see the exact error message.`);
				return res.sendStatus(400);
			}

			if (event.type === 'invoice.paid') {
				console.log("evo meeee")
				const invoice = event.data.object;
				const amountPaid = invoice.amount_paid;
				console.log("Amount Paid: ", amountPaid / 100);
				// Access subscription details and metadata
				const subscriptionDetails = invoice.subscription_details;
				const metadata = subscriptionDetails ? subscriptionDetails.metadata : null;

				if (metadata.tourId == null) {
					if (metadata) {
						const storeItems = new Map([
							[1, { priceInCents: 2999, name: "Basic plan monthly" }],
							[2, { priceInCents: 12900, name: "Premium plan monthly" }],
							[3, { priceInCents: 22800, name: "Base plan yearly" }],
							[4, { priceInCents: 118800, name: "Premium plan yearly" }],
							[5, { priceInCents: 7000, name: "Influencer package" }],
						])

						console.log("Received metadata: ", metadata);
						let user: User = await this.userManager.getUser(metadata.userId);

						if (amountPaid == 2999) {

							user.tokens = user.tokens + 100
						} else if (amountPaid == 12900) {
							user.tokens = user.tokens + 500
						} else if (amountPaid == 22800) {

							user.tokens = user.tokens + 1200
						} else if (amountPaid == 118800) {

							user.tokens = user.tokens + 6000
						} else {

							user.tokens = user.tokens + 300
						}


						await this.userManager.updateUser(user.id, user)


						console.log("Received metadata: ", metadata);  // Log it for debugging
						// Your logic here
					}
				}
			}

			if (event.type === 'checkout.session.completed') {
				const session = event.data.object;
				if (session.metadata.tourId != null) {
					console.log("Received metadata:aaaaaaaaaaaaaaa ");


					console.log(session)
					// Call your function to send an email
					sendEmail(session.customer_details.email, session.metadata.tourId);
				} else {
					console.log("evo meeee")
					const invoice = event.data.object;
					const amountPaid = invoice.amount_total;
					console.log("Amount Paid: ", amountPaid / 100);
					// Access subscription details and metadata
					const metadata = session.metadata

					if (metadata.tourId == null) {
						if (metadata) {
							const storeItems = new Map([
								[1, { priceInCents: 2999, name: "Basic plan monthly" }],
								[2, { priceInCents: 12900, name: "Premium plan monthly" }],
								[3, { priceInCents: 22800, name: "Base plan yearly" }],
								[4, { priceInCents: 118800, name: "Premium plan yearly" }],
								[5, { priceInCents: 7000, name: "Influencer package" }],
							])

							console.log("Received metadata: ", metadata);
							let user: User = await this.userManager.getUser(metadata.userId);

							if (amountPaid == 2999) {

								user.tokens = user.tokens + 100
							} else if (amountPaid == 12900) {
								user.tokens = user.tokens + 500
							} else if (amountPaid == 22800) {

								user.tokens = user.tokens + 1200
							} else if (amountPaid == 118800) {

								user.tokens = user.tokens + 6000
							} else {

								user.tokens = user.tokens + 300
							}


							await this.userManager.updateUser(user.id, user)


							console.log("Received metadata: ", metadata);  // Log it for debugging
							// Your logic here

						}



					}
				}
			}


			// Return a response to acknowledge receipt of the event
			res.json({ received: true });

		});


		async function sendEmail(to, tourId) {









			var qrCodeLink = await generateQr(tourId)
			console.log(qrCodeLink)
			var val = `<html><head></head><body><h1>Navodila za Uporabo Aplikacije HopGuides</h1><p>Začetek Ture: Začnite turo s skeniranjem QR kode, ki ste jo prejeli po e-pošti, ali vnesite edinstveno številko v polje pod skenerjem QR kod.</p><p>Navigacija: Aplikacija bo vodila do izbrane točke z vgrajeno navigacijo.</p><p>Pripovedovanje Zgodb: Ob prihodu na vsako točko bo aplikacija avtomatično predvajala pripoved v povezavi s točko.</p><p>Interaktivne Značilnosti: Na nekaterih točkah bodo na voljo interaktivne funkcije, kot so kvizi ali dodatne informacije.</p><p>Prilagodljivost: Uporabniki lahko prilagodijo vrstni red obiska točk glede na svoje preference.</p><img src=\\"${qrCodeLink}\\"></img><p>In case of any issues or questions, feel free to contact us at info@gogiro.com.</p><p style=\\"color:red;\\">***Important: Please do not reply to this email. This mailbox is not set up to receive email.</p><p>Kind regards,</p><p style=\\"color:gray;\\">Hopguides</p></body></html>`
			const body = `{
				"content": [
					{
					  "type": "text/html", 
					  "value": "${val}"
					  
					}
				  ], 
				"personalizations" : [
				  {
					"to" : [
					  {
						"email" : "${to}"
					  }
					],
					"subject" : "Reset password"
				  }
				],
				"from" : {
				  "email" : "${emailSender}"
				}
			  }`
			const request = {
				method: 'POST',
				url: '/v3/mail/send',
				body: body
			};
			client.request(request)

				.then(([response, body]) => {
					console.log(response.statusCode);
					console.log(body);
				})

		}



		async function generateQr(tourId: string): Promise<string> {


			var qrcode: QRCodes = new QRCodes();
			const image_name = Date.now() + "-" + Math.floor(Math.random() * 1000);


			const qrCodeId = Date.now() + "-" + Math.floor(Math.random() * 1000);


			await QRCode.toDataURL("https://hopguides-server-main-j7limbsbmq-oc.a.run.app/deeplink?url=" + qrCodeId, {
				scale: 15,
				width: "1000px",
			}, async function (err, base64) {
				const base64Data: Buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
				const type = base64.split(';')[0].split('/')[1];
				const params = {
					Bucket: 'hopguides/qrcodes',
					Key: `${image_name}.png`, // type is not required
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

			});

			qrcode.qrcode = `https://hopguides.s3.eu-central-1.amazonaws.com/qrcodes/${image_name}.png`
			qrcode.code = Math.floor(100000000 + Math.random() * 900000000);
			qrcode.used = false;
			qrcode.tourId = tourId
			qrcode.qrCodeId = qrCodeId

			return `https://hopguides.s3.eu-central-1.amazonaws.com/qrcodes/${image_name}.png`


			//}
		}




		this.app.use(express.json({ limit: '50mb' }));
		this.app.use(express.urlencoded({ limit: '50mb' }));
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));

		// App dashboard routes
		this.app.use('/api/pnl', new DashboardAppRouter().router);

		// App mobile-exchange routes

		this.app.use('/api/users', this.userRouter.router);

		this.app.use('/api/poi', this.poiRouter.router);

		this.app.use('/api/vehicles', this.vehicleRouter.router);

		this.app.use('/api/booking', this.bookingRouter.router);

		this.app.use('/api/bp', this.bpartnerRouter.router);

		this.app.use('/api/reports', this.reportRouter.router);

		this.app.use('/api/amadeus', this.cityRouter.router);


		this.app.get(
			'/deeplink',
			deeplink({
				fallback: 'https://hopguides-web-client-main-j7limbsbmq-oc.a.run.app/#/',
				android_package_name: 'com.hopguidesV1',
				ios_store_link:
					'https://apps.apple.com/nl/app/hopguides-slovenia/id6447904124?l=en-GB',
			})
		);


	}
}

export default new App();
