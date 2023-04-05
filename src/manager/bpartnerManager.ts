import { String } from 'aws-sdk/clients/cloudwatchevents';
import type { BPartner } from '../models/bpartner/bpartner';
import type { MongoRepository } from '../db/repository/mongoRepository';
import BPartnerRepository from '../db/repository/bpartnerRepository';
import { deserialize } from '../json';
import type { User } from '../models/user/user';
import { MulterFile } from '../classes/interfaces';
import type { TourRepository } from '../db/repository/tourRepository';
import tourRepository from '../db/repository/tourRepository';
import type { Tour } from '../models/tours/tour';
import { Contact } from '../classes/bpartner/contact';
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
    bpartner.lockCode = '12312';

    return await this.bpartnerRepository.createOne(bpartner).catch(() => {
      throw new Error('Error creating BPartner');
    });
  }

  async getBPByUser(userId: string): Promise<BPartner> {
    return (await this.bpartnerRepository.findOne({ userId })) || null;
  }

  async uploadLogo(id: string, name: string): Promise<BPartner> {
    const bpartner: BPartner = await this.getBP(id);

    bpartner.logo = name;
    return await this.bpartnerRepository.updateOne(id, bpartner).catch(() => {
      throw new Error('Error updating BPartner');
    });
  }

  async updateLockCode(id: string, code: string): Promise<BPartner> {
    const bpartner: BPartner = await this.getBP(id);

    bpartner.lockCode = code;
    return await this.bpartnerRepository.updateOne(id, bpartner).catch(() => {
      throw new Error('Error updating lock code');
    });
  }

  async getBP(bpartnerId: string): Promise<BPartner> {
    return await this.bpartnerRepository
      .getByIdOrThrow(bpartnerId)
      .catch(() => {
        throw new Error('Error getting business partner');
      });
  }

  async getBPartners(filter: any, pagination?: any): Promise<BPartner[]> {
    return await this.bpartnerRepository
      .getAll(filter, pagination)
      .catch(() => {
        throw new Error('Error getting Rents');
      });
  }

  async getContact(tourId: string, language: string): Promise<Contact> {
    console.log(tourId);
    const tour: Tour = await this.tourRepository
      .getByIdOrThrow(tourId)
      .catch(() => {
        throw new Error('Error getting tour');
      });

    const bpartner: BPartner = await this.getBP(tour.bpartnerId);

    const contact: Contact = new Contact();
    contact.email = bpartner.contact.email;
    contact.name = bpartner.name;
    contact.phone = bpartner.contact.phone;
    contact.supportDesc = bpartner.support[language];

    const logo: Logo = new Logo();
    logo.image = bpartner.logo;
    contact.logo = logo;

    return contact;
  }

  async updateBPartner(
    bpartnerId: string,
    data: Partial<BPartner>,
  ): Promise<BPartner> {
    return await this.bpartnerRepository
      .updateOne(bpartnerId, data)
      .catch((err) => {
        throw new Error('Error updating bpartner');
      });
  }

  async deleteBPartner(bpartnerId: string) {
    await this.bpartnerRepository.deleteOne({ _id: bpartnerId }).catch((e) => {
      throw new Error('Error deleting bpartner');
    });
  }
}
