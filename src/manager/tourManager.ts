import { resolve } from 'node:dns/promises';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
import type { TourRepository } from '../db/repository/tourRepository';
import tourRepository from '../db/repository/tourRepository';
import { CustomError } from '../classes/customError';
import type { SearchPagination } from '../classes/searchPagination';
import type { Tour } from '../models/tours/tour';
import { S3Service } from '../utils/s3Service';
import type { MulterFile } from '../classes/interfaces';
import { ToursReport } from '../classes/tour/toursReport';
import type { Report } from '../models/report/report';
import type { Booking } from '../models/booking/booking';
import { BookingStatus } from '../models/booking/booking';
import type { BookingRepository } from '../db/repository/bookingRepository';
import bookingRepository from '../db/repository/bookingRepository';
import { PoiHelp } from '../models/booking/PoiHelp';
import type { POI } from '../models/tours/poiModel';
import type { PreviousTourReport } from '../classes/tour/previousReportTour';
import {
  ToursWithPoints,
  PointsForTours,
  Logo,
  POICl,
} from '../classes/tour/toursWithPoints';
import type { BPartner } from '../models/bpartner/bpartner';
import {
  Characteristics,
  Location,
  Point,
  TourData,
} from '../classes/tour/tourData';
import { PointData } from '../classes/tour/pointData';
import { ReportManager } from './reportManager';
import { POIManager } from './poiManager';
import { BookingManager } from './bookingManager';
import { BPartnerManager } from './bpartnerManager';

const url = require('node:url');
const https = require('node:https');
const sizeOf = require('image-size');
const multerS3 = require('multer-s3');

class Size {
  height: string;
  width: string;
}

const s3 = new AWS.S3({
  accessKeyId: 'AKIATMWXSVRDIIFSRWP2',
  secretAccessKey: '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',
});

const s3bucket = new AWS.S3({
  accessKeyId: 'AKIATMWXSVRDIIFSRWP2',
  secretAccessKey: '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',
  params: { Bucket: 'hopguides/qrcodes' },
});
const QRCode = require('qrcode');

declare let randomString: string;

function getDistanceBetweenPoints(
  latitude1,
  longitude1,
  latitude2,
  longitude2,
) {
  const theta = longitude1 - longitude2;
  const distance =
    60 *
    1.1515 *
    (180 / Math.PI) *
    Math.acos(
      Math.sin(latitude1 * (Math.PI / 180)) *
        Math.sin(latitude2 * (Math.PI / 180)) +
        Math.cos(latitude1 * (Math.PI / 180)) *
          Math.cos(latitude2 * (Math.PI / 180)) *
          Math.cos(theta * (Math.PI / 180)),
    );

  return distance * 1.609344;
}
export class TourManager {
  tourRepository: TourRepository;
  bookingRepository: BookingRepository;
  bpartner: BookingRepository;
  bookingManager = new BookingManager();
  s3Service: S3Service;
  poiManager: POIManager;
  reportManager: ReportManager;
  bpartnerManager: BPartnerManager;
  constructor() {
    this.tourRepository = tourRepository;
    this.bookingRepository = bookingRepository;
    this.s3Service = new S3Service('giromobility-dev');
    this.poiManager = new POIManager();
    this.reportManager = new ReportManager();
    this.bpartnerManager = new BPartnerManager();
  }

  async generateQr(tourId: string): Promise<boolean> {
    //change url

    QRCode.toDataURL(
      'https://hopguides-server-main-j7limbsbmq-oc.a.run.app/deeplink?url=/',
      {
        scale: 15,
        width: '1000px',
      },
      function (err, base64) {
        const base64Data: Buffer = Buffer.from(
          base64.replace(/^data:image\/\w+;base64,/, ''),
          'base64',
        );
        const type = base64.split(';')[0].split('/')[1];
        const image_name = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const params = {
          Bucket: 'hopguides/qrcodes',
          Key: `${image_name}.${type}`, // type is not required
          Body: base64Data,
          ACL: 'public-read',
          ContentEncoding: 'base64', // required
          ContentType: `image/${type}`, // required. Notice the back ticks
        };
        s3bucket.upload(params, function (err, data) {
          if (err) {
            console.log('ERROR MSG: ', err);
          } else {
            console.log('Successfully uploaded data');
          }
        });
      },
    );

    return true;
  }

  async getTour(tourId: string): Promise<Tour> {
    return await this.tourRepository.getByIdOrThrow(tourId).catch((e) => {
      throw new CustomError(404, 'Tour not found!');
    });
  }

  async deleteTour(tourId: string) {
    const tour: Tour = await this.getTour(tourId).catch((err) => {
      throw new Error('Error getting Tours');
    });
    await this.tourRepository.deleteOne({ _id: tourId }).catch((e) => {
      console.log(e);
      throw new CustomError(404, 'Tour not deleted.');
    });
  }

  async deletePoi(tourId: string, poiId: string) {
    const tour: Tour = await this.getTour(tourId).catch((err) => {
      throw new Error('Error getting Tours');
    });

    const points = [];
    for (const p of tour.points) {
      if (p != poiId) {
        points.push(p);
      }
    }

    tour.points = points;
    await this.tourRepository.updateOne(tourId, tour).catch((err) => {
      throw new Error('Error updating Tour');
    });
  }

  async calculateSize(buffer: Buffer): Promise<Size> {
    const size = sizeOf(buffer);
    const s: Size = new Size();
    s.height = size.height;
    s.width = size.width;
    return s;
  }

  async getSize(bpartner: BPartner): Promise<Size> {
    try {
      const imgUrl = bpartner.logo;
      const options = url.parse(imgUrl);

      return new Promise(function (resolve, reject) {
        https.get(options, function (response) {
          const chunks = [];
          response
            .on('data', function (chunk) {
              chunks.push(chunk);
            })
            .on('end', function () {
              const buffer = Buffer.concat(chunks);
              const size = sizeOf(buffer);
              const s: Size = new Size();
              s.height = size.height;
              s.width = size.width;
              resolve(s);
            });
        });
      });
    } catch {
      return null;
    }
  }

  async getSingleTour(
    tourId: string,
    longitude: string,
    latitude: string,
    language: string,
  ): Promise<TourData> {
    try {
      const tour: Tour = await this.getTour(tourId).catch((err) => {
        throw new Error('Error getting Tours');
      });

      const bpartner: BPartner = await this.bpartnerManager
        .getBP(tour.bpartnerId)
        .catch((err) => {
          throw new Error('Error getting Tours');
        });

      //const logitudePartner: string = bpartner.contact.location.longitude;
      //const latitudePartner: string = bpartner.contact.location.latitude;

      //var distance = getDistanceBetweenPoints(latitude, longitude, latitudePartner, logitudePartner)

      //if (distance < 0.5) {

      const points: PoiHelp[] = [];
      const pointsArr: Point[] = [];
      if (tour != null) {
        for (const point of tour.points) {
          const poi: POI = await this.poiManager.getPoi(point);
          if (poi.offerName != '') {
            const p: PoiHelp = new PoiHelp();
            p.id = point;
            p.used = false;

            const image_name = `${Date.now()}-${Math.floor(
              Math.random() * 1000,
            )}`;
            QRCode.toDataURL(
              'http://localhost:3000/deeplink',
              {
                scale: 15,
                width: '1000px',
              },
              function (err, base64) {
                const base64Data: Buffer = Buffer.from(
                  base64.replace(/^data:image\/\w+;base64,/, ''),
                  'base64',
                );
                const type = base64.split(';')[0].split('/')[1];
                const params = {
                  Bucket: 'hopguides/qrcodes',
                  Key: `${image_name}.${type}`, // type is not required
                  Body: base64Data,
                  ACL: 'public-read',
                  ContentEncoding: 'base64', // required
                  ContentType: `image/${type}`, // required. Notice the back ticks
                };
                s3bucket.upload(params, function (err, data) {
                  if (err) {
                    console.log('ERROR MSG: ', err);
                  } else {
                    console.log('Successfully uploaded data');
                  }
                });
              },
            );

            p.qrCode = `https://hopguides.s3.eu-central-1.amazonaws.com/gqcodes/${image_name}.png`;

            points.push(p);

            var po: Point = new Point();

            if (poi.category == 'HISTORY') {
              po.icon = 'castle';
            } else if (poi.category == 'DRINKS') {
              po.icon = 'drinks';
            } else if (poi.category == 'NATURE') {
              po.icon = 'tree';
            } else if (poi.category == 'EATS') {
              po.icon = 'restaurant';
            } else if (poi.category == 'BRIDGE') {
              po.icon = 'archway';
            } else if (poi.category == 'MUSEUMS') {
              po.icon = 'persona';
            } else if (poi.category == 'EXPERIENCE') {
              po.icon = 'boat';
            }
            po.id = poi.id;
            po.text = poi.name;

            pointsArr.push(po);
          } else {
            var po: Point = new Point();
            if (poi.category == 'HISTORY') {
              po.icon = 'castle';
            } else if (poi.category == 'DRINKS') {
              po.icon = 'drinks';
            } else if (poi.category == 'NATURE') {
              po.icon = 'tree';
            } else if (poi.category == 'EATS') {
              po.icon = 'restaurant';
            } else if (poi.category == 'BRIDGE') {
              po.icon = 'archway';
            } else if (poi.category == 'MUSEUMS') {
              po.icon = 'persona';
            } else if (poi.category == 'EXPERIENCE') {
              po.icon = 'boat';
            }
            po.id = poi.id;
            po.text = poi.name;

            pointsArr.push(po);
          }
        }

        // Create reservation

        const i = Number(new Date());
        const createdScheduledRent: Booking =
          await this.bookingManager.scheduleRent(i, i, tour, bpartner, points);
        if (!createdScheduledRent)
          throw new CustomError(400, 'Cannot create rent!');

        const logo: Logo = new Logo();
        logo.image = bpartner.logo;
        logo.height = bpartner.dimensions.height;
        logo.width = bpartner.dimensions.width;

        const characteristicsArr: Characteristics[] = [];
        let characteristics: Characteristics = new Characteristics();
        characteristics.name = 'duration';
        characteristics.icon = 'duration';
        characteristics.value = tour.duration;

        characteristicsArr.push(characteristics);

        characteristics = new Characteristics();
        characteristics.name = 'length';
        characteristics.icon = 'distance';
        characteristics.value = tour.length;

        characteristicsArr.push(characteristics);

        characteristics = new Characteristics();
        characteristics.name = 'highest point';
        characteristics.icon = 'flag';
        characteristics.value = tour.highestPoint;

        characteristicsArr.push(characteristics);

        const tourReport: TourData = new TourData();
        tourReport.tourId = tour.id;
        tourReport.points = pointsArr;
        tourReport.title = tour.title[language];
        tourReport.shortInfo = tour.shortInfo[language];
        tourReport.longInfo = tour.longInfo[language];
        tourReport.image = tour.image;
        tourReport.audio = tour.audio;
        tourReport.logo = logo;
        tourReport.characteristics = characteristicsArr;
        tourReport.agreementTitle = tour.agreementTitle[language];
        tourReport.agreementDesc = tour.agreementDesc[language];
        tourReport.termsAndConditionsLink = tour.termsAndConditions;
        tourReport.bookingId = createdScheduledRent.id;

        return tourReport;
      }
      //}else{

      //console.log("Not in radius")
      //}
    } catch (err) {
      console.log(err);
    }
  }

  async getTourPoints(
    tourId: string,
    language: string,
    bookingId: string,
  ): Promise<PointData[]> {
    try {
      const tour: Tour = await this.getTour(tourId).catch((err) => {
        throw new Error('Error getting Tours');
      });

      const bpartner: BPartner = await this.bpartnerManager
        .getBP(tour.bpartnerId)
        .catch((err) => {
          throw new Error('Error getting Tours');
        });

      const pointsArr: PointData[] = [];
      if (tour != null) {
        for (const point of tour.points) {
          const poi: POI = await this.poiManager.getPoi(point);
          if (poi.offerName != '') {
            var location: Location = new Location();
            location.lat = poi.location.latitude;
            location.lng = poi.location.longitude;

            var poiHelp: PointData = new PointData();
            poiHelp.id = poi.id;
            poiHelp.audio = poi.audio;
            poiHelp.category = poi.category;
            poiHelp.images = poi.images;
            poiHelp.location = location;
            poiHelp.name = poi.name;
            poiHelp.shortInfo = poi.shortInfo[language];
            poiHelp.longInfo = poi.longInfo[language];
            poiHelp.offerName = poi.offerName;

            const booking: Booking = await this.bookingManager.getBooking(
              bookingId,
            );

            poiHelp.hasVoucher = true;
            poiHelp.voucherDesc = poi.voucherDesc[language];
            for (const p of booking.points) {
              if (p.id === poi.id) {
                poiHelp.voucher = p.qrCode;
              }
            }

            pointsArr.push(poiHelp);
          } else {
            var location: Location = new Location();
            location.lat = poi.location.latitude;
            location.lng = poi.location.longitude;

            var poiHelp: PointData = new PointData();
            poiHelp.id = poi.id;
            poiHelp.audio = poi.audio;
            poiHelp.category = poi.category;
            poiHelp.images = poi.images;
            poiHelp.location = location;
            poiHelp.name = poi.name;
            poiHelp.shortInfo = poi.shortInfo[language];
            poiHelp.longInfo = poi.longInfo[language];
            poiHelp.hasVoucher = false;

            pointsArr.push(poiHelp);
          }
        }

        return pointsArr;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getTours(filter?: any, pagination?: SearchPagination): Promise<Tour[]> {
    return await this.tourRepository.getAll(filter, pagination).catch(() => {
      throw new Error('Error getting Tours');
    });
  }

  async getToursWithPoints(
    filter?: any,
    pagination?: SearchPagination,
  ): Promise<ToursWithPoints[]> {
    try {
      const toursReport: ToursWithPoints[] = [];

      const tours: Tour[] = await this.tourRepository
        .getAll(filter, pagination)
        .catch((err) => {
          console.log(err);
          throw new Error('Error getting Tours');
        });

      const bookings: Booking[] = await this.bookingRepository
        .getAll(filter, pagination)
        .catch(() => {
          throw new Error('Error getting bookings');
        });

      for (const tour of tours) {
        let count = 0;
        const monthIndex: number = new Date().getMonth();
        const yearIndex: number = new Date().getFullYear();

        for (const booking of bookings) {
          const date = new Date(booking.from);

          const monthBooking: number = date.getMonth();
          const yearBooking: number = date.getFullYear();

          if (
            booking.tourId == tour.id &&
            monthIndex == monthBooking &&
            yearBooking == yearIndex
          ) {
            count = count + 1;
          }
        }

        const points: PointsForTours[] = [];
        for (const point of tour.points) {
          const poi: POI = await this.poiManager.getPoi(point);

          const p: PointsForTours = new PointsForTours();
          const poiHelp: POICl = new POICl();
          poiHelp.id = poi.id;
          poiHelp.audio = poi.audio;
          poiHelp.bpartnerId = poi.bpartnerId;
          poiHelp.category = poi.category;
          poiHelp.contact = poi.contact;
          poiHelp.workingHours = poi.workingHours;
          poiHelp.files = poi.files;
          poiHelp.icon = poi.icon;
          poiHelp.images = poi.images;
          poiHelp.location = poi.location;
          poiHelp.name = poi.name;
          poiHelp.shortInfo = poi.shortInfo;
          poiHelp.longInfo = poi.longInfo;
          poiHelp.menu = poi.menu;
          poiHelp.offerName = poi.offerName;
          poiHelp.price = poi.price;
          poiHelp.partner = poi.partner;

          p.point = poiHelp;

          const report: Report = await this.reportManager.getReport(poi.id, {});

          p.monthlyUsed = report.monthlyUsedCoupons;

          points.push(p);
        }

        const tourReport: ToursWithPoints = new ToursWithPoints();
        tourReport.tourId = tour.id;
        tourReport.points = points;
        tourReport.title = tour.title;
        tourReport.shortInfo = tour.shortInfo;
        tourReport.longInfo = tour.longInfo;
        tourReport.currency = tour.currency;
        tourReport.images = tour.images;
        tourReport.price = tour.price;
        tourReport.image = tour.image;
        tourReport.audio = tour.audio;
        tourReport.duration = tour.duration;
        tourReport.length = tour.length;
        tourReport.highestPoint = tour.highestPoint;
        tourReport.agreementTitle = tour.agreementTitle;
        tourReport.agreementDesc = tour.agreementDesc;
        tourReport.termsAndConditions = tour.termsAndConditions;
        tourReport.noOfRidesAMonth = count;
        tourReport.bpartnerId = tour.bpartnerId;

        toursReport.push(tourReport);
      }

      return toursReport;
    } catch (err) {
      console.log(err);
    }
  }

  async getPreviousReportForTour(
    tourId: string,
    filter: any,
    pagination?: any,
  ): Promise<PreviousTourReport[]> {
    const groupByArray = function (xs, key) {
      return xs.reduce(function (rv, x) {
        const v = key instanceof Function ? key(x) : x[key];
        const el = rv.find((r) => r && r.key === v);
        if (el) {
          el.values.push(x);
        } else {
          rv.push({ key: v, values: [x] });
        }
        return rv;
      }, []);
    };

    const bookings: Booking[] = await this.bookingRepository
      .getAll(filter, pagination)
      .catch(() => {
        throw new Error('Error getting bookings');
      });

    interface helpObject {
      from: string;
      id: string;
    }

    let helpArray: helpObject[] = [];

    for (const booking of bookings) {
      if (booking.tourId == tourId) {
        const date = new Date(booking.from);

        const monthBooking: number = date.getMonth();
        const yearBooking: number = date.getFullYear();

        const helpObject: helpObject = {
          from: monthBooking.toString() + yearBooking.toString(),
          id: tourId,
        };

        helpArray.push(helpObject);
      }
    }

    helpArray = groupByArray(helpArray, 'from');

    interface helpObjectSort {
      from: string;
      count: number;
    }

    class objectStr {
      key: string;
      values: helpObject[];
    }

    interface helpObjectSort {
      from: string;
      count: number;
    }

    const helpArraySort: helpObjectSort[] = [];

    helpArray.forEach((element) => {
      const obj = Object.assign(new objectStr(), element);

      const helpArrayObj = { from: obj.key, count: obj.values.length };
      helpArraySort.push(helpArrayObj);
    });

    return helpArraySort;
  }

  async updateTour(tourId: string, data: Partial<Tour>) {
    console.log(data);
    await this.tourRepository.updateOne(tourId, data).catch((err) => {
      throw new Error('Error updating Tour');
    });
  }

  async createTour(tour: Tour): Promise<Tour> {
    return await this.tourRepository.createOne(tour).catch(() => {
      throw new CustomError(500, 'Tour not created!');
    });
  }

  async uploadMenu(tourId: string, file: MulterFile): Promise<Tour> {
    const tour: Tour = await this.getTour(tourId);

    tour.image = file.location;
    return await this.tourRepository.updateOne(tourId, tour).catch(() => {
      throw new Error('Error updating Tour');
    });
  }

  async uploadAudio(tourId: string, file: MulterFile): Promise<Tour> {
    const tour: Tour = await this.getTour(tourId);

    tour.audio = file.location;
    return await this.tourRepository.updateOne(tourId, tour).catch(() => {
      throw new Error('Error updating Tour');
    });
  }

  async getTermsAndConditions(tourId: string): Promise<string> {
    const tour: Tour = await this.getTour(tourId);
    return tour.termsAndConditions;
  }
}
