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

async function handleChargeSucceeded(charge) {
	const amountPaid = charge.amount / 100; // Stripe provides the amount in cents, so divide by 100 for the actual amount.
	const currency = charge.currency;
	const paymentMethod = charge.payment_method_details.card.brand; // Example: 'visa', 'mastercard', etc.
	const description = charge.description; // Description of the charge (if provided during charge creation)
  
	const userId = charge.metadata.userId;
	console.log("user id " + userId)
	let user: User = await this.userManager.getByIdOrThrow(userId);

	if(charge.amount == 22800 || charge.amount  == 2999){
		user.tokens = user.tokens + 100
	}else if(charge.amount == 12900 || charge.amount == 118800){
		user.tokens = user.tokens + 500
	}
	await this.userManager.updateUser(user.id, user)
	
	console.log(`Payment was successful. Amount: ${amountPaid} ${currency} using ${paymentMethod}. Description: ${description}`);
  }

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

		this.app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
			
			const sig = request.headers['stripe-signature'];
		  
			let event;
		  
			try {
			  event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
			} catch (err) {
			  response.status(400).send(`Webhook Error: ${err.message}`);
			  return;
			}
		  
		  
			// Handle the event
			switch (event.type) {
				case 'checkout.session.completed':
				  const session = event.data.object;
				  handleChargeSucceeded(session);
				  break;
				case 'charge.succeeded':
				  const charge = event.data.object;
				  handleChargeSucceeded(charge);
				  break;
				// ... handle other event types
				default:
				  console.log(`Unhandled event type ${event.type}`);
			  }
			// Return a 200 response to acknowledge receipt of the event
			response.send();
		  });
		  
		 

		this.app.use(express.json({limit: '50mb'}));
		this.app.use(express.urlencoded({limit: '50mb'}));
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
				fallback: 'https://hopguides-web-client-main-j7limbsbmq-oc.a.run.app/#/' ,
				android_package_name: 'com.hopguidesV1',
				ios_store_link:
				  'https://apps.apple.com/nl/app/hopguides-slovenia/id6447904124?l=en-GB',
			})
		);

	
	}
}

export default new App();
