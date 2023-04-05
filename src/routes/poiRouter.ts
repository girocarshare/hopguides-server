import * as fs from 'node:fs';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import type { IRequest, IResponse } from '../classes/interfaces';
import { POIManager } from '../manager/poiManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import { withErrorHandler } from '../utils/utils';
import type { POI } from '../models/tours/poiModel';
import { BPartner } from '../models/bpartner/bpartner';
import { deserialize, serialize } from '../json';
import { CustomError } from '../classes/customError';
import { ToursReport } from '../classes/tour/toursReport';
import { TourManager } from '../manager/tourManager';
import type { ToursWithPoints } from '../classes/tour/toursWithPoints';
import { simpleAsync } from './util';
import { BaseRouter } from './baseRouter';
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: 'AKIATMWXSVRDIIFSRWP2',
  secretAccessKey: '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',
});
let rString: string;
function randomstring(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

interface IBkRequest extends IRequest {
  point: POI;
  pointId: string;
}

export class POIRouter extends BaseRouter {
  poiManager: POIManager;
  bpartnerManager: BPartnerManager;
  tourManager: TourManager;

  fileFilter = (req, file, cb) => {
    if (
      file.originalname.match(/\.(pdf|docx|txt|jpg|jpeg|png|ppsx|ppt|mp3)$/)
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  multerS3Config = multerS3({
    s3,
    bucket: 'hopguides/menu',
    metadata(req, file, cb) {
      cb(null, { fieldName: globalThis.rString });
    },
    key(req, file, cb) {
      const list = file.originalname.split('.');
      globalThis.rString = `${randomstring(10)}.${list[list.length - 1]}`;
      cb(null, globalThis.rString);
    },
  });

  upload = multer({
    storage: this.multerS3Config,
    fileFilter: this.fileFilter,
  });

  constructor() {
    super(true);
    this.poiManager = new POIManager();
    this.bpartnerManager = new BPartnerManager();
    this.tourManager = new TourManager();
    this.upload = multer({
      storage: this.multerS3Config,
      fileFilter: this.fileFilter,
    });
    this.init();
  }

  init(): void {
    this.router.post(
      '/:pointId/uploadMenu',
      //userSecurity(),
      //ownedBookingInStatusMdw(RentStatus.DRIVING),
      this.upload.single('file'),
      simpleAsync(async (req: IBkRequest) => {
        // Upload
        if (!req.file) console.log('Error while uploading file');

        return await this.poiManager.uploadMenu(
          req.params.pointId,
          req.file.location,
        );
      }),
    );

    /** POST update poi */
    this.router.post(
      '/update',
      //allowFor([AdminRole, ManagerRole, MarketingRole]),
      //parseJwt,

      this.upload.array('file'),
      simpleAsync(async (req: IBkRequest, res: IResponse) => {
        try {
          const jsonObj = JSON.parse(req.body.point);
          const point = jsonObj as POI;

          const arrayy = [];
          const updatedPoi: POI = await this.poiManager.updatePoi(
            point.id,
            point,
          );

          for (const f of req.files) {
            console.log(f);
            if (f.originalname.substring(0, 6).trim() === 'audio2') {
              await this.poiManager.uploadAudio(point.id, f.location);
            }
            if (f.originalname.substring(0, 4).trim() === 'menu') {
              console.log(point.id + f.location);
              await this.poiManager.uploadMenu(point.id, f.location);
            }
            if (f.originalname.substring(0, 7).trim() === 'partner') {
              console.log('partnerrrr');
              arrayy.push(f.location);
            }
          }

          await this.poiManager.uploadImages(point.id, arrayy);
          const tours: ToursWithPoints[] =
            await this.tourManager.getToursWithPoints();

          return res.status(200).send(tours);
        } catch (err) {
          console.log(err.errors);
        }
      }),
    );
  }
}
