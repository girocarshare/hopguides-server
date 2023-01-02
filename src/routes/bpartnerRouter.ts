import { IRequest, IResponse } from '../classes/interfaces';
import { UserManager } from '../manager/userManager';
import {/* AdminRole, allowFor, MarketingRole, parseJwt,*/ withErrorHandler } from '../utils/utils';
import { User, UserRoles, UserStatus } from '../models/user/user';
import { BaseRouter } from './baseRouter';
import { deserialize, serialize } from '../json';
import { validateOrThrow } from '../validations';
import { BPartnerManager } from '../manager/bpartnerManager';
import { CreateBPartnerPayload } from '../classes/bpartner/createBPartner';
import { BPartner } from '../models/bpartner/bpartner';
import { CustomError } from '../classes/customError';

export class BPartnerRouter extends BaseRouter {
	userManager: UserManager;
	bpartnerManager: BPartnerManager;

	constructor() {
		super(true);
		this.userManager = new UserManager();
		this.bpartnerManager = new BPartnerManager();
		this.init();
	}

	init(): void {

		
		/** POST create BPartner from ADMIN user   */
		this.router.post(
			'/:userId/createBP',
			//allowFor([AdminRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				try{
				const user: User = await this.userManager.getUser(req.params.userId);
				const bpartner: BPartner = await this.bpartnerManager.getBPByUser(user.id);
				/** START OF SECURITY CHECKS   */
				/** Check if owner & customer not BANNED   */
				if (user.status === UserStatus.BANNED) throw new CustomError(443, 'User is banned');
				if (bpartner) throw new CustomError(400, 'BPartner already exists');
				/** END OF SECURITY CHECKS   */

				const bpartnerData: CreateBPartnerPayload = deserialize(
					CreateBPartnerPayload,
					req.body
				);
				validateOrThrow(bpartnerData);
				const createdBPartner: BPartner = await this.bpartnerManager.createBP(
					user,
					bpartnerData
				);
				const serializeFilter: string =
					req.role === UserRoles.ADMIN ? 'protected' : 'public';

				return res.status(200).send(createdBPartner);
				}catch(err){
					console.log(err.error)
				}
			})
		);



		/** GET fetches BPartner list for admin panel   
		this.router.get(
			'/',
			allowFor([AdminRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const bpartners: BPartner[] = await this.bpartnerManager.getBPs();
				return res.respond(
					200,
					bpartners.map(u => serialize(u))
				);
			})
		);

		/** GET fetches the number of all BPartner   
		this.router.get(
			'/count',
			allowFor([AdminRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const count: number = await this.bpartnerManager.countBPs();
				return res.respond(200, count);
			})
		);

		/** GET fetches promotion data   
		this.router.get(
			'/:bpartnerId',
			allowFor([AdminRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const bpartner: BPartner = await this.bpartnerManager.getBP(req.params.bpartnerId);

				return res.respond(200, serialize(bpartner));
			})
		);

		/** PATCH patch code from ADMIN user   
		this.router.patch(
			'/:bpartnerId',
			allowFor([AdminRole, MarketingRole]),
			parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const bpartner: BPartner = await this.bpartnerManager.getBP(req.params.bpartnerId);
				const updatedBPartner: BPartner = await this.bpartnerManager.patchBP(
					bpartner,
					req.body
				);
				const serializeFilter: string =
					req.role === UserRoles.ADMIN ? 'protected' : 'public';

				return res.respond(200, serialize(updatedBPartner, serializeFilter));
			})
		);*/
	}
}
