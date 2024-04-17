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

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	video: string;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	text: string;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	link: string;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	forVideo: boolean;

	@dbField()
	@jsonProperty({ deserialize: true, serialize: true })
	campaign: string;
}
