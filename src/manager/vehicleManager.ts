import { CreateVehiclePayload } from '../classes/vehicle/createVehiclePayload';
import { CustomError } from '../classes/customError';
import VehicleRepo, {
  VehicleRepository,
} from '../db/repository/vehicleRepository';
import { deserialize } from '../json';
import { Vehicle } from '../models/vehicle/vehicle';
import { VehicleLiveInfo } from '../models/vehicle/liveInfo';

export class VehicleManager {
  vehicleRepository: VehicleRepository;

  constructor() {
    this.vehicleRepository = VehicleRepo;
  }

  async createVehicle(vehicle: Vehicle): Promise<Vehicle> {
    return await this.vehicleRepository.createOne(vehicle).catch(() => {
      throw new CustomError(500, 'Vehicle not created!');
    });
  }

  async create(
    userId: string,
    vehicleData: CreateVehiclePayload
  ): Promise<Vehicle> {
    const payload: Vehicle = deserialize(Vehicle, vehicleData);
    payload.liveInfo = new VehicleLiveInfo();

    const vehicle: Vehicle = await this.vehicleRepository
      .createOne(payload)
      .catch(() => {
        throw new Error('Error creating a Vehicle');
      });

    return vehicle;
  }
}
