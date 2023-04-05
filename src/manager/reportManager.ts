import * as AWS from 'aws-sdk';
import type { BookingRepository } from '../db/repository/bookingRepository';
import bookingRepository from '../db/repository/bookingRepository';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
import type { POI } from '../models/tours/poiModel';
import type { PoiHelp } from '../models/booking/PoiHelp';
import { CustomError } from '../classes/customError';
import type { BPartner } from '../models/bpartner/bpartner';
import type { TourRepository } from '../db/repository/tourRepository';
import tourRepository from '../db/repository/tourRepository';
import type { Booking } from '../models/booking/booking';
import { BookingStatus } from '../models/booking/booking';
import { deserialize, serialize } from '../json';
import { POIManager } from './poiManager';
import { BPartnerManager } from './bpartnerManager';
const multerS3 = require('multer-s3');

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

interface helpObjectSort {
  from: string;
  count: number;
}

export class ReportManager {
  bookingRepository: BookingRepository;
  tourRepository: TourRepository;
  poiManager: POIManager;
  bpartnerManager: BPartnerManager;

  constructor() {
    this.bookingRepository = bookingRepository;
    this.tourRepository = tourRepository;
    this.poiManager = new POIManager();
    this.bpartnerManager = new BPartnerManager();
  }

  async getReport(
    companyId: string,
    filter: any,
    pagination?: any,
  ): Promise<Report> {
    const bookings: Booking[] = await this.bookingRepository
      .getAll(filter, pagination)
      .catch(() => {
        throw new Error('Error getting bookings');
      });

    const p: POI = await this.poiManager.getPoi(companyId).catch(() => {
      throw new Error('Error getting poi');
    });
    const bPartner: BPartner = await this.bpartnerManager
      .getBP(p.bpartnerId)
      .catch(() => {
        throw new Error('Error getting business partner');
      });

    let count = 0;
    const monthIndex: number = new Date().getMonth();
    const yearIndex: number = new Date().getFullYear();

    for (const booking of bookings) {
      const date = new Date(booking.from);

      const monthBooking: number = date.getMonth();
      const yearBooking: number = date.getFullYear();
      for (const point of booking.points) {
        if (
          point.id.toString() == companyId &&
          point.used &&
          monthIndex == monthBooking &&
          yearBooking == yearIndex
        ) {
          count = count + 1;
        }
      }
    }

    const report: Report = new Report();
    report.pointId = companyId;
    report.monthlyUsedCoupons = count;
    report.name = p.name;
    report.bpartnerName = bPartner.name;
    report.bpartnerEmail = bPartner.contact.email;
    report.bpratnerPhone = bPartner.contact.phone;
    report.bpratnerPhone2 = bPartner.contact.phone2;
    report.offerName = p.offerName;
    report.menu = p.menu;

    return report;
  }

  async getReports(
    companyId: string,
    filter: any,
    pagination?: any,
  ): Promise<helpObjectSort[]> {
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
      points: PoiHelp[];
    }

    let helpArray: helpObject[] = [];

    for (const booking of bookings) {
      for (const point of booking.points) {
        if (point.id.toString() == companyId && point.used) {
          const date = new Date(booking.from);

          const monthBooking: number = date.getMonth();
          const yearBooking: number = date.getFullYear();

          const helpObject: helpObject = {
            from: monthBooking.toString() + yearBooking.toString(),
            points: booking.points,
          };

          helpArray.push(helpObject);
        }
      }
    }

    helpArray = groupByArray(helpArray, 'from');

    interface helpObjectSort {
      from: string;
      count: number;
    }

    var helpArraySort: helpObjectSort[] = [];

    class objectStr {
      key: string;
      values: helpObject[];
    }

    interface helpObjectSort {
      from: string;
      count: number;
    }

    var helpArraySort: helpObjectSort[] = [];

    helpArray.forEach((element) => {
      const obj = Object.assign(new objectStr(), element);

      const helpArrayObj = { from: obj.key, count: obj.values.length };
      helpArraySort.push(helpArrayObj);
    });

    return helpArraySort;
  }

  async generateQr(companyId: string): Promise<boolean> {
    try {
      QRCode.toDataURL(
        `http://localhost:3000/#/report/${companyId}`,
        { scale: 15, width: '1000px' },
        function (err, base64) {
          const base64Data: Buffer = Buffer.from(
            base64.replace(/^data:image\/\w+;base64,/, ''),
            'base64',
          );
          const type = base64.split(';')[0].split('/')[1];
          const image_name = `${Date.now()}-${Math.floor(
            Math.random() * 1000,
          )}`;
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
    } catch {
      return false;
    }
  }
}
