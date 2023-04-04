import { BPartner } from '../models/bpartner/bpartner';
import { MongoRepository } from '../db/repository/mongoRepository';
import BPartnerRepository from '../db/repository/bpartnerRepository';
import { deserialize } from '../json';
import { User } from '../models/user/user';
import { MulterFile } from '../classes/interfaces';
import tourRepository, { TourRepository } from '../db/repository/tourRepository';
import { Tour } from '../models/tours/tour';
import { Contact } from '../classes/bpartner/contact';
import { String } from 'aws-sdk/clients/cloudwatchevents';
import { Logo } from '../classes/tour/toursWithPoints';

export class BPartnerManager {
	bpartnerRepository: MongoRepository<BPartner>;
	tourRepository: TourRepository;

	constructor() {
		this.bpartnerRepository = BPartnerRepository;
		this.tourRepository = tourRepository;
	}

	async createBP(user: User, bpartner: BPartner): Promise<BPartner> {
	
		bpartner.userId = user.id;
		bpartner.lockCode = "12312"

		return await this.bpartnerRepository.createOne(bpartner).catch(() => {
			throw new Error('Error creating BPartner');
		});
	}

	async getBPByUser(userId: string): Promise<BPartner> {
		return (await this.bpartnerRepository.findOne({ userId: userId })) || null;
	}

	
	async uploadLogo(id: string, name: string): Promise<BPartner> {
		var bpartner: BPartner = await this.getBP(id)

		bpartner.logo = name
		return await this.bpartnerRepository.updateOne(id, bpartner).catch(() => {
			throw new Error('Error updating BPartner');
		});
	}

	async updateLockCode(id: string, code: string): Promise<BPartner> {
		var bpartner: BPartner = await this.getBP(id)

		bpartner.lockCode = code
		return await this.bpartnerRepository.updateOne(id, bpartner).catch(() => {
			throw new Error('Error updating lock code');
		});
	}


	async getBP(bpartnerId: string): Promise<BPartner> {
		return await this.bpartnerRepository.getByIdOrThrow(bpartnerId).catch(() => {
			throw new Error('Error getting business partner');
		});
	}

	async getBPartners(filter: any, pagination?: any): Promise<BPartner[]> {
		return await this.bpartnerRepository.getAll(filter, pagination).catch(() => {
			throw new Error('Error getting Rents');
		});
	}

	async getContact(tourId: string, language: string): Promise<Contact> {
		console.log(tourId)
		var tour: Tour =  await this.tourRepository.getByIdOrThrow(tourId).catch(() => {
			throw new Error('Error getting tour');
		});

		var bpartner: BPartner = await this.getBP(tour.bpartnerId)

		var contact : Contact = new Contact();
		contact.email = bpartner.contact.email;
		contact.name = bpartner.name;
		contact.phone = bpartner.contact.phone;
		contact.supportDesc = bpartner.support[language];

		var logo: Logo = new Logo()
		logo.image = bpartner.logo
		contact.logo = logo

		return contact;

	}

	async updateBPartner(bpartnerId: string, data: Partial<BPartner>): Promise<BPartner> {
		return await this.bpartnerRepository.updateOne(bpartnerId, data).catch(err => {
		  throw new Error('Error updating bpartner');
		});
	  }

	  async deleteBPartner(bpartnerId: string) {

		
		await this.bpartnerRepository.deleteOne({ _id: bpartnerId }).catch((e) => {
			throw new Error('Error deleting bpartner');
		});
	}

}
