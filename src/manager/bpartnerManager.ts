import { BPartner } from '../models/bpartner/bpartner';
import { MongoRepository } from '../db/repository/mongoRepository';
import BPartnerRepository from '../db/repository/bpartnerRepository';
import { deserialize } from '../json';
import { User } from '../models/user/user';

export class BPartnerManager {
	bpartnerRepository: MongoRepository<BPartner>;

	constructor() {
		this.bpartnerRepository = BPartnerRepository;
	}

	async createBP(user: User, bpartner: BPartner): Promise<BPartner> {
	
		bpartner.userId = user.id;

		console.log(bpartner)
		return await this.bpartnerRepository.createOne(bpartner).catch(() => {
			throw new Error('Error creating BPartner');
		});
	}

	async getBPByUser(userId: string): Promise<BPartner> {
		return (await this.bpartnerRepository.findOne({ userId: userId })) || null;
	}

	

	async getBP(bpartnerId: string): Promise<BPartner> {
		return await this.bpartnerRepository.getByIdOrThrow(bpartnerId).catch(() => {
			throw new Error('Error getting business partner');
		});
	}

}
