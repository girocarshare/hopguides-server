import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class QRCodes {

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	qrcode: string;


	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	code: number;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	used: boolean;
}
