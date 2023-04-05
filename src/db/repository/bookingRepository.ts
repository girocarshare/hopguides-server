import { Booking } from '../../models/booking/booking';
import { deserializeFromDb } from '../dbUtils';
import { MongoRepository } from './mongoRepository';

export class BookingRepository extends MongoRepository<Booking> {
  constructor() {
    super();
  }

  mapObject(data: any): Booking {
    return deserializeFromDb(Booking, data);
  }
}

export default new BookingRepository();
