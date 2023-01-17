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
import { POIManager } from '../manager/poiManager';
import { TourManager } from '../manager/tourManager';
import { Tour } from '../models/tours/tour';
import { ToursReport } from '../classes/tour/toursReport';
import { ToursWithPoints } from '../classes/tour/toursWithPoints';
import { POI } from '../models/tours/poi';
import { PreviousTourReport } from '../classes/tour/previousReportTour';


export class TourRouter extends BaseRouter {
	tourManager: TourManager;
	poiManager: POIManager;

	constructor() {
		super(true);
		this.tourManager = new TourManager();
		this.poiManager = new POIManager();

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

		this.router.get(
			'/allReport',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const tours: ToursReport[] = await this.tourManager.getToursForReport();
				return res.status(200).send(tours);

			})
		);

		this.router.get(
			'/allToursWithPoints',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				
				const tours: ToursWithPoints[] = await this.tourManager.getToursWithPoints();
				return res.status(200).send(tours);

			})
		);


		this.router.get(
			'/previousReport/:tourId',
			//allowFor([AdminRole, SupportRole, ManagerRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				console.log(req.params.tourId)
				if (req.params.tourId == null) {
					res.status(200)
				} else {
					const filter: any = {};
					const data: PreviousTourReport[] = await this.tourManager.getPreviousReportForTour(req.params.tourId, filter);
					return res.status(200).send(data);
				}
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
		this.router.post(
			'/update/:tourId',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				var tour: Tour = await this.tourManager.getTour(req.body.tourId)
				tour.price = req.body.tourPrice

				const updatedTour: ToursReport[] = await this.tourManager.updateTour(
					tour.id,
					deserialize(Tour, tour)
				);
				return res.status(200).send(serialize(updatedTour));
			})
		);

		/** POST create tour from dash */
		this.router.post(
			'/',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {

					for (var point of req.body.points) {
						const poi: POI = await this.poiManager.getPoi(point);

						if (poi != null) {

						} else {

							return res.status(500).send("Error point with that id doesn't exist");
						}
					}

					const createdTour: Tour = await this.tourManager.createTour(
						deserialize(Tour, req.body)
					);

					return res.status(200).send(createdTour);
				} catch (err) {
					console.log(err.error)
				}
			})
		);

		this.router.post(
			'/add',
			//allowFor([AdminRole, ManagerRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try {

					var arr: string[] = []
					for (var point of req.body.points) {
						
						const poi: POI = await this.poiManager.createPOI(deserialize(POI, point));
						arr.push(poi.id)
					}

					var t = {
						title: req.body.title,
						shortInfo: req.body.shortInfo,
						longInfo: req.body.longInfo,
						price: req.body.price,
						points: arr
					}
					const createdTour: Tour = await this.tourManager.createTour(
						deserialize(Tour, t)
					);

					return res.status(200).send(createdTour);
				} catch (err) {
					console.log(err.error)
				}
			})
		);

	}
}
