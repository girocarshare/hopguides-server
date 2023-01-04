import { IRequest, IResponse } from '../classes/interfaces';
import {
	/*AdminRole,
	allowFor,
	ManagerRole,
	MarketingRole,
	parseJwt,
	ServiceRole,
	SupportRole,*/
	withErrorHandler
} from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { deserialize, serialize } from '../json';
import { TourManager } from '../manager/tourManager';
import { Tour } from '../models/tours/tour';

export class TourRouter extends BaseRouter {
	tourManager: TourManager;

	constructor() {
		super(true);
		this.tourManager = new TourManager();

		this.init();
	}

	init(): void {
		/** GET fetches tour list for admin panel */
		this.router.get(
			'/all',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
		
				const tours: Tour[] = await this.tourManager.getTours();
				return res.status(200).send(tours);
				
			})
		);

		/** GET fetches tour data */
		this.router.get(
			'/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const tour: Tour = await this.tourManager.getTour(req.params.tourId);
				return res.respond(200, serialize(tour));
			})
		);

		/** PATCH patch tour from ADMIN user */
		this.router.patch(
			'/:tourId',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const updatedTour: Tour = await this.tourManager.updateTour(
					req.params.tourId,
					deserialize(Tour, req.body)
				);
				return res.respond(200, serialize(updatedTour));
			})
		);

		/** POST create tour from dash */
		this.router.post(
			'/',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {
					const createdTour: Tour = await this.tourManager.createTour(
						deserialize(Tour, req.body)
					);
					
					return res.status(200).send(createdTour);
				} catch (err) {
					console.log(err)
				}
			})
		);
	}
}
