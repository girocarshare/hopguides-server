import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import type { IRequest, IResponse } from '../classes/interfaces';
import { UserManager } from '../manager/userManager';
import { parseJwt, withErrorHandler } from '../utils/utils';
import type { User } from '../models/user/user';
import { UserRoles, UserStatus } from '../models/user/user';
import { deserialize, serialize } from '../json';
import { validateOrThrow } from '../validations';
import { BPartnerManager } from '../manager/bpartnerManager';
import { CreateBPartnerPayload } from '../classes/bpartner/createBPartner';
import type { BPartner } from '../models/bpartner/bpartner';
import { CustomError } from '../classes/customError';
import type { Contact } from '../classes/bpartner/contact';
import { BaseRouter } from './baseRouter';
import { simpleAsync } from './util';
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
  bpartner: BPartner;
  bpartnerId: string;
}

export class BPartnerRouter extends BaseRouter {
  userManager: UserManager;
  bpartnerManager: BPartnerManager;
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
    this.userManager = new UserManager();
    this.bpartnerManager = new BPartnerManager();
    this.init();
  }

  init(): void {
    /** GET all bpartners   */
    this.router.get(
      '/all',
      //allowFor([AdminRole, ManagerRole, SupportRole]),
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        const filter: any = {};

        const bpartners: BPartner[] = await this.bpartnerManager.getBPartners(
          filter,
        );

        const arr = [];
        for (const bpartner of bpartners) {
          const bp = {
            id: bpartner.id,
            name: bpartner.name,
          };
          arr.push(bp);
        }

        return res.status(200).send(arr);
      }),
    );

    /** GET all bpartners   */
    this.router.get(
      '/allwithdata',
      //allowFor([AdminRole, ManagerRole, SupportRole]),
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        const filter: any = {};

        const bpartners: BPartner[] = await this.bpartnerManager.getBPartners(
          filter,
        );

        return res.status(200).send(bpartners);
      }),
    );

    /** GET support data */
    this.router.post(
      '/support/:tourId',
      //allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
      //parseJwt,
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        const contact: Contact = await this.bpartnerManager.getContact(
          req.params.tourId,
          req.body.language,
        );
        return res.status(200).send(contact);
      }),
    );

    this.router.post(
      '/updateLogo',
      //userSecurity(),
      //ownedBookingInStatusMdw(RentStatus.DRIVING),
      parseJwt,
      this.upload.single('file'),
      simpleAsync(async (req: IRequest, res: IResponse) => {
        // Upload
        const user: User = await this.userManager.getUser(req.userId);
        console.log(user);
        if (!req.file) console.log('Error while uploading file');

        return await this.bpartnerManager.uploadLogo(
          req.userId,
          req.file.location,
        );
      }),
    );

    this.router.post(
      '/changeLockCode/:code',
      //userSecurity(),
      //ownedBookingInStatusMdw(RentStatus.DRIVING),
      parseJwt,
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        // Upload
        const user: User = await this.userManager.getUser(req.userId);
        return await this.bpartnerManager.updateLockCode(
          req.userId,
          req.params.code,
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
          const jsonObj = JSON.parse(req.body.bpartner);
          const bpartner = jsonObj as BPartner;

          const arrayy = [];
          const updatedBpartner: BPartner =
            await this.bpartnerManager.updateBPartner(bpartner.id, bpartner);

          for (const f of req.files) {
            await this.bpartnerManager.uploadLogo(bpartner.id, f.location);
          }
          return res.status(200).send('Success');
        } catch (err) {
          console.log(err.errors);
        }
      }),
    );

    /** DELETE business partner */
    this.router.get(
      '/delete/:bpartnerId',
      //allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
      //parseJwt,
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        try {
          await this.bpartnerManager.deleteBPartner(req.params.bpartnerId);

          return res.status(200).send('Success');
        } catch (e) {
          return res.status(500).send('Error');
        }
      }),
    );
  }
}
