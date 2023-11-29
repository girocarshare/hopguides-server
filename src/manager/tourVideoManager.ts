import tourVideoRepository, { TourVideoRepository } from '../db/repository/tourVideoRepository';
import { CustomError } from '../classes/customError';
import { SearchPagination } from '../classes/searchPagination';
import { Tour } from '../models/tours/tour';
import { MulterFile } from '../classes/interfaces';
import { ToursReport } from '../classes/tour/toursReport';
import { Report } from '../models/report/report';
import { BPartnerManager } from '../manager/bpartnerManager';
import { Booking, BookingStatus } from '../models/booking/booking';
import { BookingManager } from '../manager/bookingManager';
import bookingRepository, { BookingRepository } from '../db/repository/bookingRepository';
import QrcodesRepository from '../db/repository/qrcodesRepository';

import { PoiHelp } from '../models/booking/PoiHelp';
import { POI } from '../models/tours/poiModel';
import { POIManager } from './poiManager';
import { ReportManager } from './reportManager';
import { PreviousTourReport } from '../classes/tour/previousReportTour';
import { ToursWithPoints, PointsForTours, Logo, POICl, PointsShort, PointShort, PointsForGeoJson, ToursForGeoJson } from '../classes/tour/toursWithPoints';
import * as AWS from 'aws-sdk';
import { BPartner } from '../models/bpartner/bpartner';
import { Characteristics, Location, Point, TourData } from '../classes/tour/tourData';
import {  PointData } from '../classes/tour/pointData';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
import { resolve } from 'dns/promises';
import { QRCodes } from '../models/qrcodes/qrcodes';
import { MongoRepository } from '../db/repository/mongoRepository';
import userRepository from '../db/repository/userRepository';
import { UserManager } from './userManager';
import { User } from '../models/user/user';
import qrcodesRepository from '../db/repository/qrcodesRepository';
import { setMaxIdleHTTPParsers } from 'http';
import { TourVideo } from '../models/tours/tourvideo';

var sizeOf = require('image-size');
const url = require('url')
const https = require('https')
function makeid(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

export class TourVideoManager {
	tourVideoRepository: TourVideoRepository;
	qrcodesRepository: MongoRepository<QRCodes>;
	bookingRepository: BookingRepository;
	bpartner: BookingRepository;
	bookingManager = new BookingManager();
	userManager = new UserManager();
	poiManager: POIManager;
	reportManager: ReportManager;
	bpartnerManager: BPartnerManager;
	constructor() {
		this.tourVideoRepository = tourVideoRepository;
		this.qrcodesRepository = QrcodesRepository;
		this.bookingRepository = bookingRepository;
		this.poiManager = new POIManager();
		this.reportManager = new ReportManager();
		this.bpartnerManager = new BPartnerManager();
	}


	async getTour(tourId: string): Promise<TourVideo> {
		return await this.tourVideoRepository.getByIdOrThrow(tourId.trim()).catch((e) => {

			throw new CustomError(404, 'Tour not found!');
		});
	}


	async updateTour(tourId: string, data: Partial<TourVideo>): Promise<TourVideo> {

		return await this.tourVideoRepository.updateOne(tourId, data).catch((err) => {
			throw new Error('Error updating Tour');
		});

	}

	async createTour(tour: TourVideo): Promise<TourVideo> {
		return await this.tourVideoRepository.createOne(tour).catch(() => {
			throw new CustomError(500, 'Tour not created!');
		});
	}


	async getTours(filter?: any, pagination?: SearchPagination): Promise<TourVideo[]> {
		return await this.tourVideoRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting Tours');
		});
	}


}