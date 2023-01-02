import { BaseRouter } from '../baseRouter';
import { TourRouter } from '../tourRouter';

export class DashboardAppRouter extends BaseRouter {
	constructor() {
		super();
		// this.router.use('/auth', new AuthRouter().router);
		// this.router.use('/user', new UserRouter().router);
		// this.router.use('/promo', new PromoRouter().router);
		// this.router.use('/vehicle', new VehicleRouter().router);
		// this.router.use('/report', new ReportRouter().router);
		this.router.use('/tour', new TourRouter().router);
	}
}
