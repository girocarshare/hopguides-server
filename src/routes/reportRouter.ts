import { IRequest, IResponse } from '../classes/interfaces';
import { withErrorHandler } from '../utils/utils';
import { BaseRouter } from './baseRouter';
import { Report } from '../models/report/report';
import { Tour } from '../models/tours/tour';
import { ReportManager } from '../manager/reportManager';
import { TourManager } from '../manager/tourManager';
import { CustomError } from '../classes/customError';
import { NotificationType } from '../models/notification/notificationType';
import * as fs from 'fs';
import { POI } from '../models/tours/poiModel';
import { POIManager } from '../manager/poiManager';
const { createInvoice } = require('../classes/createInvoice');

const getStream = require('get-stream');

const PDFDocument = require('pdfkit');
import { Notification } from '../models/notification/notification';

import * as sgMail from '@sendgrid/mail';
import * as schedule from 'node-schedule';
import { simpleAsync } from './util';

interface helpObjectSort {
  from: string;
  count: number;
}

sgMail.setApiKey(
  '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'
);
var emailSender = 'beta-app@gogiro.app';

export class ReportRouter extends BaseRouter {
  reportManager: ReportManager;
  tourManager: TourManager;
  poiManager: POIManager;

  constructor() {
    super(true);
    this.reportManager = new ReportManager();
    this.tourManager = new TourManager();
    this.poiManager = new POIManager();
    this.init();
  }

  init(): void {
    /** GET report for one company/point  */
    this.router.get(
      '/:id',
      //allowFor([AdminRole, SupportRole, ServiceRole]),
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        try {
          const filter: any = {};
          const report: Report = await this.reportManager.getReport(
            req.params.id,
            filter
          );
          return res.status(200).send(report);
        } catch (err) {
          return res.status(412).send(err);
        }
      })
    );

    this.router.get(
      '/previous/:id',
      //allowFor([AdminRole, SupportRole, ServiceRole]),
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        const filter: any = {};
        const helpObjectS: helpObjectSort[] =
          await this.reportManager.getReports(req.params.id, filter);
        return res.status(200).send(helpObjectS);
      })
    );

    /** GET generate qr code for company   */
    this.router.get(
      '/qr/:id',
      //allowFor([AdminRole, SupportRole, ServiceRole]),
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        function sleep(ms) {
          return new Promise(resolve => {
            setTimeout(resolve, ms);
          });
        }
        try {
          var tf = false;
          tf = await this.reportManager.generateQr(req.params.id);

          await sleep(1000);

          if (tf) {
            fs.readFile(
              './images/menu/' + req.params.id.trim() + '.png',
              (error, data) => {
                if (error) {
                  throw error;
                }
                var file = data;

                var filename = req.params.id.trim() + '.png';
                res.status(200);
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader(
                  'Content-Disposition',
                  'attachment; filename=' + filename
                );
                res.write(file, 'binary');
                res.end();
              }
            );
          }
        } catch (err) {
          console.log(err.error);
        }

        return res.status(200);
      })
    );

    /** GET send invoice email  */
    this.router.get(
      '/emails/sendEmails',
      //allowFor([AdminRole, SupportRole, ServiceRole]),
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        //const job = schedule.scheduleJob('0 0 1 * *', async function () {
        //const job = schedule.scheduleJob('45 * * * *',  async function () {

        var pois: POI[] = await this.poiManager.getPois();
        for (var poi of pois) {
          var report: Report = await this.reportManager.getReport(poi.id, {});
          var help: string[] = poi.price.toString().split('€');
          var price = report.monthlyUsedCoupons * Number(help[0]);
          price = Math.round(price * 100) / 100;

          const invoice = {
            shipping: {
              name: 'Tourism Ljubljana',
              address: '1234 Main Street',
              city: 'Ljubljana',
              country: 'Slovenia',
              postal_code: 1000,
            },
            items: [
              {
                name: report.name,
                offerName: report.offerName,
                monthlyUsedCoupons: 1,
                price: 15,
              },
            ],
            subtotal: price,
            paid: 0,
            invoice_nr: 1234,
          };

          const pdfBuffer = await createInvoice(invoice, 'invoice.pdf');
          const pdfBase64string = pdfBuffer.toString('base64');

          sgMail.send({
            to: 'lunazivkovic@gmail.com', // change so that poi.contact.email gets email
            from: `${emailSender}`,
            subject: 'Monthly invoice to Tourism Ljubljana',
            html:
              `Dear partner,<br/><br/>
						
						Please invoice Tourism Ljubljana 15eur with tax until the 15th of this month.<br/>
						Attached, you will find invoice report pdf document.<br/><br/>
						
						For more information, please visit` +
              ' <a href=http://localhost:3001/#/report/' +
              poi.id +
              '>this website</a><br/><br/>Kind regards, <br/> GoGiro.',
            attachments: [
              {
                content: pdfBase64string,
                filename: 'attachment.pdf',
                type: 'application/pdf',
                disposition: 'attachment',
              },
            ],
          });
        }

        //});
        return res.status(200);
      })
    );
  }
}
