import { BPartner } from '../models/bpartner/bpartner';
import { MongoRepository } from '../db/repository/mongoRepository';
import BPartnerRepository from '../db/repository/bpartnerRepository';
import { deserialize } from '../json';
import { User } from '../models/user/user';
import { CreateBPartnerPayload } from '../classes/bpartner/createBPartner';
/*import { SearchPagination } from '../classes/searchPagination';
import { PatchBPartnerAdminPayload } from '../classes/bpartner/patchBPartnerAdminPayload';
import { validateOrThrow } from '../validations';*/

export class BPartnerManager {
	bpartnerRepository: MongoRepository<BPartner>;

	constructor() {
		this.bpartnerRepository = BPartnerRepository;
	}

	async createBP(user: User, bpartnerData: CreateBPartnerPayload): Promise<BPartner> {
		const bpartner: BPartner = deserialize(BPartner, bpartnerData);
		bpartner.userId = user.id;

		return await this.bpartnerRepository.createOne(bpartner).catch(() => {
			throw new Error('Error creating BPartner');
		});
	}

	async getBPByUser(userId: string): Promise<BPartner> {
		return (await this.bpartnerRepository.findOne({ userId: userId })) || null;
	}
/*
	async getBP(bpartnerId: string): Promise<BPartner> {
		return await this.bpartnerRepository.getByIdOrThrow(bpartnerId).catch(() => {
			throw new Error('Error getting Vehicle');
		});
	}

	async getBPs(filter?: any, pagination?: SearchPagination): Promise<BPartner[]> {
		return await this.bpartnerRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting all BPartners');
		});
	}

	async countBPs(): Promise<number> {
		return await this.bpartnerRepository.count().catch(() => {
			throw new Error('Error counting BPartners');
		});
	}

	

	async updateBP(bpartnerId: string, data: any): Promise<BPartner> {
		return await this.bpartnerRepository.updateOne(bpartnerId, data).catch(() => {
			throw new Error('Error updating BPartner');
		});
	}

	async patchBP(bpartner: BPartner, patchData: any): Promise<BPartner> {
		const bpartnerData: PatchBPartnerAdminPayload = deserialize(
			PatchBPartnerAdminPayload,
			patchData
		);
		validateOrThrow(bpartnerData);
		bpartner.modifiedAt = Date.now();

		const bpartnerId: string = bpartner.id;
		delete bpartner.id;

		return await this.updateBP(bpartnerId, bpartnerData).catch(() => {
			throw new Error('Error updating BPartner');
		});
	}*/
}
