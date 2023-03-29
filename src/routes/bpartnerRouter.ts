import { IRequest, IResponse } from '../classes/interfaces';
import { UserManager } from '../manager/userManager';
import { withErrorHandler } from '../utils/utils';
import { User, UserRoles, UserStatus } from '../models/user/user';
import { BaseRouter } from './baseRouter';
import { deserialize, serialize } from '../json';
import { validateOrThrow } from '../validations';
import { BPartnerManager } from '../manager/bpartnerManager';
import { CreateBPartnerPayload } from '../classes/bpartner/createBPartner';
import { BPartner } from '../models/bpartner/bpartner';
import { CustomError } from '../classes/customError';
import { Contact } from '../classes/bpartner/contact';

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

		/** GET all bpartners   */
		this.router.get(
			'/all',
			//allowFor([AdminRole, ManagerRole, SupportRole]),
			withErrorHandler(async (req: IRequest, res: IResponse) => {

				const filter: any = {};

				const bpartners: BPartner[] = await this.bpartnerManager.getBPartners(filter);

				var arr = []
				for (var bpartner of bpartners) {
					var bp = {
						id: bpartner.id,
						name: bpartner.name
					}
					arr.push(bp)
				}

				return res.status(200).send(arr);
			})
		);

		/** GET support data */
		this.router.post(
			'/support/:tourId',
			//allowFor([AdminRole, ManagerRole, ServiceRole, SupportRole, MarketingRole]),
			//parseJwt,
			withErrorHandler(async (req: IRequest, res: IResponse) => {
				const contact: Contact = await this.bpartnerManager.getContact(req.params.tourId, req.body.language);
				return res.status(200).send(contact);
			})
		);

	}
}
