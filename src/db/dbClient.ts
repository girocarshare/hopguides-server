import { Db, MongoClient } from 'mongodb';
import UserRepository from './repository/userRepository';
/*import ReportRepository from './repository/reportRepository';
import VehicleRepository from './repository/carRepository';
import RideRepository from './repository/rideRepository';
import BookingRepository from './repository/bookingRepository';
import TransactionRepository from './repository/transactionRepository';
import MonetaRepository from './repository/monetaRepository';
import CountryRepository from './repository/countryRepository';
import NotificationRepository from './repository/notificationRepository';
import GeofenceRepository from './repository/geofenceRepository';
import PromotionsRepository from './repository/promotionsRepository';
import BlastRepository from './repository/blastRepository';
import SettingsRepository from './repository/settingsRepository';
import EventlogRepository from './repository/eventlogRepository';
import IoTEventRepository from './repository/iotEventRepository';
import TourRepository from './repository/tourRepository';
import OperStatsRepository from './repository/operStatsRepository';
import OperaRepository from './repository/operaRepository';
import blacklistRepository from './repository/blacklistRepository';*/

import { Logger } from 'tslog';
var DB_URI_COMMON="mongodb+srv://app_giro_common_stage:2X8JxIP5nbXZ6yxt@giro-prod-cluster-0.rflif.gcp.mongodb.net/giro-common-stage?retryWrites=true&w=majority"
var DB_DATABASE_COMMON="giro-common-stage"
var DB_URI="mongodb+srv://app_giro_mobility_stage:2X8JxIP5nbXZ6yxt@giro-prod-cluster-0.rflif.gcp.mongodb.net/giro-staging?retryWrites=true&w=majority"
var DB_DATABASE="giro-staging"
const logger: Logger = new Logger();

class DbClient {
	constructor() { }

	async connectDb(): Promise<boolean> {
		logger.info('::INFO:: Connecting Mongo DB...');

		/** DATABASE COMMON GIRO */
		const mongoUriCommon: string = DB_URI_COMMON || '';
		const dbNameCommon: string = DB_DATABASE_COMMON || '';
		if (!mongoUriCommon || !dbNameCommon) throw new Error('No Mongo URI or no DB name');
		const dbCommon: MongoClient = await MongoClient.connect(mongoUriCommon, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		logger.info(`::INFO:: dbNameCommon: ${dbNameCommon}`);
		const databaseCommon: Db = dbCommon.db(dbNameCommon);
		/** DATABASE GIROCARSHARE */
		const mongoUri: string = DB_URI || '';
		const dbName: string = DB_DATABASE || '';
		if (!mongoUri || !dbName) throw new Error('No Mongo URI or no DB name');
		const db: MongoClient = await MongoClient.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		logger.info(`::INFO:: dbName: ${dbName}`);
		const database: Db = db.db(dbName);

		await database
			.collection('users')
			.createIndex({ phone: 1, inviteCode: 1 }, { unique: true });
		await database.collection('users').createIndex({ 'address.geoLocation': '2dsphere' });
		/*await database.collection('mb-vehicles').createIndex({ 'address.geoLocation': '2dsphere' });
		await database.collection('mb-vehicles').createIndex({ IMEI: 1 }, { unique: true });
		await database.collection('mb-rents').createIndex({ status: 1, from: 1, to: 1 });
		await database.collection('mb-rents').createIndex({ code: 1 }, { unique: true });
		await database.collection('mb-rideshares').createIndex({ status: 1, from: 1, to: 1 });
		await database.collection('mb-rideshares').createIndex({ QRcode: 1 }, { unique: true });*/

		/*await databaseCommon
			.collection('citiesCountry')
			.createIndex({ name: 1, code: 1 }, { unique: true });
		await databaseCommon.collection('promotions').createIndex({ code: 1 }, { unique: true });*/

		/** Initialize collections */
		UserRepository.setCollection(database.collection('users'));
		/*VehicleRepository.setCollection(database.collection('mb-vehicles'));
		BookingRepository.setCollection(database.collection('mb-rents'));
		RideRepository.setCollection(database.collection('mb-rideshares'));
		ReportRepository.setCollection(database.collection('mb-reports'));
		TransactionRepository.setCollection(database.collection('mb-transactions'));
		MonetaRepository.setCollection(database.collection('moneta'));
		OperaRepository.setCollection(database.collection('opera'));
		EventlogRepository.setCollection(database.collection('eventlog'));
		IoTEventRepository.setCollection(database.collection('iot-events'));
		TourRepository.setCollection(database.collection('tours'));
		OperStatsRepository.setCollection(database.collection('oper-stats'));

		CountryRepository.setCollection(databaseCommon.collection('citiesCountry'));
		GeofenceRepository.setCollection(databaseCommon.collection('geofence'));
		NotificationRepository.setCollection(databaseCommon.collection('notificationTypes'));
		// PromoSettingsRepository.setCollection(databaseCommon.collection('promoSettings'));
		BlastRepository.setCollection(databaseCommon.collection('promoBlast'));
		PromotionsRepository.setCollection(databaseCommon.collection('promotions'));
		SettingsRepository.setCollection(databaseCommon.collection('settings'));
		blacklistRepository.setCollection(databaseCommon.collection('blacklist'));*/
		return true;
	}
}

export default new DbClient();
