import * as express from 'express';
//import { createRespondAndThrowErr } from './middlewares/renders';
import { UserRouter } from './routes/userRouter';
import { VehicleRouter } from './routes/vehicleRouter';
import { BookingRouter } from './routes/bookingRouter';
import { ReportRouter } from './routes/reportRouter';
import { POIRouter } from './routes/poiRouter';
//import { catchErrors } from './utils/errorhandles';
import {
	AdminRole,
	allowFor,
	ManagerRole,
	paramCheck,
	ServiceRole,
	SupportRole,
	UserRoleWith
} from './utils/utils';
/*import { UserCarRouter } from './routes/userCarRouter';
import { RideRouter } from './routes/rideshareRouter';
import { CountryRouter } from './routes/countryRouter';
import { CronRouter } from './routes/cronRouter';
import { PromoRouter } from './routes/promotionsRouter';
import { MobileAppRouter } from './routes/me/router';
import { ExternalAppRouter } from './routes/ext/router';
import { ValuRouter } from './routes/valuRouter';
import { GeofenceRouter } from './routes/geofenceRouter';
import { EventlogRouter } from './routes/eventlogRouter';
import { IoTExchangeRouter } from './routes/iot/router';
import { TestRouter } from './routes/testRouter';
import { HotelRouter } from './routes/hotelRouter';*/
import { DashboardAppRouter } from './routes/dash/router';
//import { checkAppOrigin, parseUserLocale } from './routes/me/util';*/
import { BPartnerRouter } from './routes/bpartnerRouter';

const xmlparser = require('express-xml-bodyparser');
const bearerToken = require('express-bearer-token');

class App {
	public app: express.Application;

	private userRouter: UserRouter;
	private vehicleRouter: VehicleRouter;
	private bookingRouter: BookingRouter;
	private bpartnerRouter: BPartnerRouter;
	private reportRouter: ReportRouter;
	private poiRouter: POIRouter;
	/*
	private rideRouter: RideRouter;
	private countryRouter: CountryRouter;
	private promotionsRouter: PromoRouter;
	private cronRouter: CronRouter;
	private valuRouter: ValuRouter;
	private hotelRouter: HotelRouter;
	private geofenceRouter: GeofenceRouter;
	private eventlogRouter: EventlogRouter;
	private testRouter: TestRouter;*/

	constructor() {
		this.app = express();
		//this.testRouter = new TestRouter();
		this.userRouter = new UserRouter();
		this.vehicleRouter = new VehicleRouter();
		this.bookingRouter = new BookingRouter();
		this.bpartnerRouter = new BPartnerRouter();
		this.reportRouter = new ReportRouter();
		this.poiRouter = new POIRouter();
		/*
		this.userCarRouter = new UserCarRouter();
		this.rideRouter = new RideRouter();
		this.countryRouter = new CountryRouter();
		this.promotionsRouter = new PromoRouter();
		this.cronRouter = new CronRouter();
		this.valuRouter = new ValuRouter();
		this.hotelRouter = new HotelRouter();
		this.geofenceRouter = new GeofenceRouter();
		this.eventlogRouter = new EventlogRouter();*/
		this.config();
	}

	config(): void {
		this.app.set('trust proxy', true);
		this.app.use(function (req: any, res: any, next: any) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
			res.header(
				'Access-Control-Allow-Headers',
				'Origin, X-Requested-With, Content-Type, Accept, accessToken, Accept-Language'
			);
			res.header('Access-Control-Expose-Headers', 'accessToken');
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

		/*this.app.use(createRespondAndThrowErr);*/

		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));

		// App dashboard routes
		this.app.use('/api/pnl', new DashboardAppRouter().router);

		// App mobile-exchange routes
		/*this.app.use(
			'/api/me',
			// bearerToken({ reqKey: 'bearerToken' }), //Comment for DEV
			// checkAppOrigin(), //Comment for DEV
			parseUserLocale(),
			new MobileAppRouter().router
		);*/

		this.app.use('/api/users', this.userRouter.router);

		this.app.use('/api/poi', this.poiRouter.router);

/*		this.app.use(
			'/api/users/:userId/vehicles',
			function (req: any, res: any, next: any) {
				req.method === 'OPTIONS' ? res.sendStatus(200) : next();
			},
			allowFor([
				AdminRole,
				SupportRole,
				ManagerRole,
				ServiceRole,
				UserRoleWith(paramCheck('userId'))
			]),
			this.userCarRouter.router
		);
*/
		this.app.use('/api/vehicles', this.vehicleRouter.router);

		this.app.use('/api/booking', this.bookingRouter.router);
		
		this.app.use('/api/bp', this.bpartnerRouter.router);

		this.app.use('/api/reports', this.reportRouter.router);
/*
		this.app.use('/api/ride', this.rideRouter.router);

		this.app.use('/api/promo', this.promotionsRouter.router);

		this.app.use('/api/country', this.countryRouter.router);

		this.app.use('/api/cron', this.cronRouter.router);

		this.app.use('/api/test', this.testRouter.router);

		this.app.use(
			'/api/htl',
			xmlparser({
				normalize: false, // Trim whitespace inside text nodes
				normalizeTags: false, // Transform tags to lowercase
				sanitize: true,
				arrayNotation: false
			}),
			this.hotelRouter.router
		);

		this.app.use(
			'/api/valu',
			xmlparser({
				normalize: false, // Trim whitespace inside text nodes
				normalizeTags: false, // Transform tags to lowercase
				sanitize: true,
				arrayNotation: false
			}),
			this.valuRouter.router
		);

		this.app.use('/api/geof', this.geofenceRouter.router);

		this.app.use('/api/eventlog', this.eventlogRouter.router);

		this.app.use('/api/ext', bearerToken(), new ExternalAppRouter().router);

		this.app.use('/api/iot', bearerToken(), new IoTExchangeRouter().router);

		this.app.use(catchErrors);*/
	}
}

export default new App();
