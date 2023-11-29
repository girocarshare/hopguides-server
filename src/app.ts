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
import { UserManager } from './manager/userManager';
const stripe = require('stripe')('sk_test_51MAy4gDmqfM7SoUzbMp9mpkECiaBifYevUo2rneRcI4o2jnF11HeY1yC5F1fiUApKjDIkkMUidTgmgStWvbyKLvx00Uvoij5vH');
const endpointSecret = "whsec_udE8WsgMxTywVI44nhBJtjoGuZzqB2Ce";
//global.CronJob = require('./db/cron.js');
import * as sgMail from '@sendgrid/mail';
const client = require('@sendgrid/client');
client.setApiKey("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");
sgMail.setApiKey("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")
var emailSender = "beta-app@gogiro.app";


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
				event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], endpointSecret);
			} catch (err) {
				console.log(`⚠️  Webhook signature verification failed. Check the logs to see the exact error message.`);
				return res.sendStatus(400);
			}

			if (event.type === 'checkout.session.completed') {
				console.log("Received metadata:aaaaaaaaaaaaaaa ");
				const session = event.data.object;

				console.log(session)
				// Call your function to send an email
				sendEmail(session.customer_email, session.metadata.tourId);
			}

			if (event.type === 'invoice.paid') {
				const invoice = event.data.object;
			
				// Assuming that the customer email and metadata are available on the invoice object
				const customerEmail = invoice.customer_email; // Replace with correct field if different
				const metadata = invoice.metadata; // Assuming metadata is directly on the invoice
			
				console.log("Received metadata: ", metadata);
				if (metadata && customerEmail) {
				  sendEmail(customerEmail, metadata.tourId);
				}
			  }

			// Return a response to acknowledge receipt of the event
			res.json({ received: true });
		});


		async function sendEmail(to, tourId) {


			console.log("tooooo " + to)


			sgMail.send({
				to: to, // change so that poi.contact.email gets email
				from: emailSender,
				subject: "Tour changes accepted",
				html: `Dear,<br/><br/>
					
					Changes made on tour with id: ${tourId} <br/>
					`
			})
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
