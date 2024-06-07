import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';
import { min } from '../../validations/decorators';
import { VehicleType } from '../vehicle/enums';
import { ReturnLocation } from './returnOptions';
import { LocalizedField } from '../localizedField';
import { Vehicle } from '../vehicle/vehicle';

export class Agreement {
	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@jsonProperty()
	@dbField()
	link: string;

    @jsonProperty()
	@dbField()
	addressee: string;

    @jsonProperty()
	@dbField()
	email: string;
    
    @jsonProperty()
	@dbField()
	offer_number: string;

    
    @jsonProperty()
	@dbField()
	language: string;

    
    @jsonProperty()
	@dbField()
	category: string;
}
