import { Db, MongoClient } from 'mongodb';
import UserRepository from './repository/userRepository';
import TourRepository from './repository/tourRepository';
import VehicleRepository from './repository/vehicleRepository';
import BookingRepository from './repository/bookingRepository';
import BPartnerRepository from './repository/bpartnerRepository';
import POIRepository from './repository/poiRepository';

import { Logger } from 'tslog';
var DB_URI_COMMON = 'mongodb://127.0.0.1:27017/';
var DB_DATABASE_COMMON = 'giro-common-stage';
var DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/';
var DB_DATABASE = 'giro-staging';
const logger: Logger = new Logger();

console.log('DB_URI', DB_URI);

class DbClient {
  constructor() {}

  async connectDb(): Promise<boolean> {
    logger.info('::INFO:: Connecting Mongo DB...');

    /** DATABASE COMMON GIRO */
    // const mongoUriCommon: string = DB_URI_COMMON || '';
    // const dbNameCommon: string = DB_DATABASE_COMMON || '';
    // if (!mongoUriCommon || !dbNameCommon)
    //   throw new Error('No Mongo URI or no DB name');
    // const dbCommon: MongoClient = await MongoClient.connect(mongoUriCommon, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });
    // logger.info(`::INFO:: dbNameCommon: ${dbNameCommon}`);
    // const databaseCommon: Db = dbCommon.db(dbNameCommon);
    /** DATABASE GIROCARSHARE */
    const mongoUri: string = DB_URI || '';
    const dbName: string = DB_DATABASE || '';
    if (!mongoUri || !dbName) throw new Error('No Mongo URI or no DB name');
    const db: MongoClient = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`::INFO:: dbName: ${dbName}`);
    const database: Db = db.db(dbName);

    await database
      .collection('users')
      .createIndex({ phone: 1, inviteCode: 1 }, { unique: true });
    await database
      .collection('users')
      .createIndex({ 'address.geoLocation': '2dsphere' });
    UserRepository.setCollection(database.collection('users'));
    TourRepository.setCollection(database.collection('tours'));
    VehicleRepository.setCollection(database.collection('vehicle'));
    BookingRepository.setCollection(database.collection('booking'));
    BPartnerRepository.setCollection(database.collection('bpartner'));
    POIRepository.setCollection(database.collection('poi'));

    return true;
  }
}

export default new DbClient();
