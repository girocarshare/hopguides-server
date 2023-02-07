import { BaseRouter } from '../baseRouter';
import { TourRouter } from '../tourRouter';

export class DashboardAppRouter extends BaseRouter {
	constructor() {
		super();
		this.router.use('/tour', new TourRouter().router);
	}
}
