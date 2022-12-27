
export enum VehicleStatus {
	PENDING = 'PENDING',
	VERIFIED = 'VERIFIED',
	SERVICE = 'SERVICE',
	HIDDEN = 'HIDDEN',
	DELETED = 'DELETED',
	STOLEN = 'STOLEN'
}

export enum VehicleAvailable {
	ONLINE = 'ONLINE',
	RESERVED = 'RESERVED',
	TOUR_RESERVED = 'TOUR_RESERVED',
	DRIVING = 'DRIVING',
	OFFLINE = 'OFFLINE'
}

export enum VehicleType {
	SCOOTER = 'SCOOTER',
	BIKE = 'BIKE',
	CAR = 'CAR',
	OTHER = 'OTHER'
}

export enum VehicleVersion {
	TST100 = 'TST100',
	FMB120 = 'FMB120',
	TST100Bike = 'TST100Bike',
	SEGWAYIOT = 'SEGWAYIOT',
	NONE = 'NONE'
}

export enum LockStatus {
	LOCKED = 'LOCKED',
	UNLOCKED = 'UNLOCKED'
}