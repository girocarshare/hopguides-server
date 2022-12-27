import { dbField } from '../../db/decorators';
import { jsonProperty } from '../../json/decorations';

export class BookingDocs {
	@jsonProperty()
	@dbField()
	contractPDF: string = null;

	@jsonProperty()
	@dbField()
	invoicePDF: string = null;

	@jsonProperty()
	@dbField()
	receiptPDF: string = null;
}
