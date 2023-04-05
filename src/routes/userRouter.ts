import * as fs from 'node:fs';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import * as sgMail from '@sendgrid/mail';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
import { User, UserRoles, UserStatus } from '../models/user/user';
import { CustomError } from '../classes/customError';
import type { IRequest, IResponse } from '../classes/interfaces';
import { MulterFile } from '../classes/interfaces';
import { LoginPayload } from '../classes/user/loginPayload';
import { deserialize, serialize } from '../json';
import { UserManager } from '../manager/userManager';
import { BPartnerManager } from '../manager/bpartnerManager';
import { parseJwt, withErrorHandler } from '../utils/utils';
import { validateOrThrow } from '../validations';
import { BPartner } from '../models/bpartner/bpartner';
import type { RegisterPayload } from '../classes/user/registerPayload';
import { BaseRouter } from './baseRouter';
import { simpleAsync } from './util';
const multerS3 = require('multer-s3');

sgMail.setApiKey(
  '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',
);
const emailSender = 'beta-app@gogiro.app';
const s3 = new AWS.S3({
  accessKeyId: 'AKIATMWXSVRDIIFSRWP2',
  secretAccessKey: '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',
});
interface IBkRequest extends IRequest {
  request: RegisterPayload;
}
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

export class UserRouter extends BaseRouter {
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
    bucket: 'hopguides/logos',
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

  getFields = multer();
  constructor() {
    super();
    this.userManager = new UserManager();
    this.bpartnerManager = new BPartnerManager();
    this.upload = multer({
      storage: this.multerS3Config,
      fileFilter: this.fileFilter,
    });

    this.init();
  }

  init(): void {
    this.router.post(
      '/addUser',
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        console.log(req.body);
        const createdUser: User = await this.userManager.createUser(
          deserialize(User, req.body),
        );
        return res.status(200).send(createdUser);
      }),
    );
    this.router.post(
      '/sendRegistrationEmail',
      //this.getFields.any(),
      this.upload.single('file'),
      simpleAsync(async (req: IBkRequest, res: IResponse) => {
        {
          const jsonObj = JSON.parse(req.body.request);
          const data = jsonObj as RegisterPayload;

          console.log(data);
          const createdUser: User =
            await this.userManager.sendRegistrationEmail(
              deserialize(User, req.body),
            );

          data.userId = createdUser.id;

          const bpartnerData: BPartner = deserialize(BPartner, data);
          const createdBP: BPartner = await this.bpartnerManager.createBP(
            createdUser,
            bpartnerData,
          );

          console.log(createdBP);
          const fileName = `https://hopguides.s3.eu-central-1.amazonaws.com/logos/${globalThis.rString}`;
          await this.bpartnerManager.uploadLogo(createdBP.id, fileName);
          sgMail.send({
            to: 'lunazivkovic@gmail.com', // change so that poi.contact.email gets email
            from: `${emailSender}`,
            subject: 'Set password',
            html: `Dear partner,<br/><br/>
							
							You have been invited to join our platform. Kindly click on the link below to register.<br/><br/> <a href=http://localhost:3001/#/setPassword/${req.body.email} id=get> Register now </a><br/><br/>In case of any issues or questions, feel free to contact us at info@gogiro.com.<br/><br/><text style=\"color:red;\">***Important: Please do not reply to this email.  This mailbox is not set up to receive email.</text><br/><br/><br/>Kind regards,<br/><br/> <text style=\"color:gray;\">GoGiro</text><br/>
							`,
          });
          return res.status(200).send('Success');
        }
      }),
    );

    this.router.post(
      '/forgotPassword',
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        sgMail.send({
          to: 'lunazivkovic@gmail.com', // change so that poi.contact.email gets email
          from: `${emailSender}`,
          subject: 'Reset password',
          html: `Dear partner,<br/><br/>
							
							Kindly click on the link below to reset your password.<br/><br/> <a href=http://localhost:3001/#/setPassword/${req.body.email} id=get> Reset password </a><br/><br/>In case of any issues or questions, feel free to contact us at info@gogiro.com.<br/><br/><text style=\"color:red;\">***Important: Please do not reply to this email.  This mailbox is not set up to receive email.</text><br/><br/><br/>Kind regards,<br/><br/> <text style=\"color:gray;\">GoGiro</text><br/>
							`,
        });
        return res.status(200).send();
      }),
    );

    this.router.post(
      '/register',
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        const createdUser: User = await this.userManager.register(
          deserialize(User, req.body),
        );

        return res.status(200).send('Success');
      }),
    );

    this.router.post(
      '/login',
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        try {
          const login: LoginPayload = deserialize(LoginPayload, req.body);
          validateOrThrow(login);
          const user: User = await this.userManager.getUserByEmail(login.email);
          /** START OF SECURITY CHECKS  */
          //performBasicChecks(user);
          /** END OF SECURITY CHECKS  */
          if (!user)
            return res.throwErr(new CustomError(404, 'User does not exist'));

          const loggedUserData: {
            userData: User;
            userJwt: string;
          } = await this.userManager.login(login);
          res.append('accessToken', loggedUserData.userJwt);
          return res.status(200).send({ userJwt: loggedUserData.userJwt });
        } catch (err) {
          return res.status(412).send(err);
        }
      }),
    );

    this.router.get(
      '/getRole',
      parseJwt,
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        const user: User = await this.userManager.getUser(req.userId);
        const role: string = user.role;
        return res.status(200).send(role);
      }),
    );
  }
}
