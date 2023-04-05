import { Logger } from 'tslog';
import { Booking } from '../models/booking/booking';
import type { IRequest, IResponse } from '../classes/interfaces';
import { deserialize, serialize } from '../json';
import { VehicleManager } from '../manager/vehicleManager';
import { UserManager } from '../manager/userManager';
import { Vehicle } from '../models/vehicle/vehicle';
import { withErrorHandler } from '../utils/utils';
import { BaseRouter } from './baseRouter';

export class VehicleRouter extends BaseRouter {
  vehicleManager: VehicleManager;
  logger: Logger = new Logger();

  upload: any;

  constructor() {
    super(true);
    this.vehicleManager = new VehicleManager();
    this.init();
  }

  init(): void {
    /** POST create vehicle  */
    this.router.post(
      '/',
      //allowFor([AdminRole, ManagerRole, MarketingRole]),
      //parseJwt,
      withErrorHandler(async (req: IRequest, res: IResponse) => {
        try {
          const createdVehicle: Vehicle =
            await this.vehicleManager.createVehicle(
              deserialize(Vehicle, req.body),
            );

          return res.status(200).send(createdVehicle);
        } catch (err) {
          console.log(err.error);
        }
      }),
    );
  }
}
