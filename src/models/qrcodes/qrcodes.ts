import { dbField, id } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';
import { generateUuid } from '../../utils/utils';

export class QRCodes {

	@id()
	@dbField()
	@jsonProperty({ deserialize: false, serialize: true })
	id: string = generateUuid();

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	qrcode: string;


	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	code: number;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	used: boolean;

	
	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	tourId: string;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	qrCodeId: string;
}
