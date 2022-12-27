
export enum StatusTxt {
	Undefined = 'Undefined',
	InQueue = 'InQueue',
	WaitingForConfirmation = 'WaitingForConfirmation',
	ContractConfirmed = 'ContractConfirmed',
	Confirmed = 'Confirmed',
	Reserved = 'Reserved',
	Canceled = 'Canceled',
	Failed = 'Failed'
}


/*export enum ReportType {
	Contract = 'Contract',
	Reservation = 'Reservation',
	Refund = 'Refund'
}

export enum Status {
	Undefined = 0,
	InQueue = 1,
	WaitingForConfirmation = 2,
	ContractConfirmed = 3,
	Confirmed = 4,
	Reserved = 5,
	Canceled = 6,
	Failed = 7
}

export function mapValuStatus(status: StatusTxt): number {
	switch (status) {
		case StatusTxt.Undefined:
			return Status.Undefined;
		case StatusTxt.InQueue:
			return Status.InQueue;
		case StatusTxt.WaitingForConfirmation:
			return Status.WaitingForConfirmation;
		case StatusTxt.ContractConfirmed:
			return Status.ContractConfirmed;
		case StatusTxt.Confirmed:
			return Status.Confirmed;
		case StatusTxt.Reserved:
			return Status.Reserved;
		case StatusTxt.Canceled:
			return Status.Canceled;
		case StatusTxt.Failed:
			return Status.Failed;
		default:
			return 0;
	}
}

export enum ValuError {
	ERR_NOERROR = 0,
	ERR_UNKNOWN_ERROR = 1,
	ERR_COM_EXCEPTION = 2,
	ERR_INVALID_PASSWORD = 3,
	ERR_FORBIDDEN = 4,
	ERR_ITEM_LIST_EMPTY = 5,
	ERR_ITEM_LIST_NOT_EMPTY = 6,
	ERR_MAXIMUM_ITEMS_REACHED = 7,
	ERR_INVALID_UUID = 8,
	ERR_INVALID_MSISDN = 9,
	ERR_CHECK_OPERATOR = 10,
	ERR_INVALID_LA = 11,
	ERR_INVALID_TSID = 12,
	ERR_INVALID_MESSAGE = 13,
	ERR_INVALID_MESSAGE_INIT = 14,
	ERR_INVALID_MESSAGE_FINAL = 15,
	ERR_INVALID_PAGECODE = 16,
	ERR_INVALID_PRICE = 17,
	ERR_INVALID_QUANTITY = 18,
	ERR_INVALID_VATRATE = 19,
	ERR_INVALID_VATRATEDESCRIPTION = 20,
	ERR_INVALID_DESCRIPTION = 21,
	ERR_INVALID_CURRENCY = 22,
	ERR_MISSING_DYNAMIC_PRICE = 23,
	ERR_RESERVATION_NOT_ACTIVE = 24,
	ERR_ALEADY_CANCELED = 25,
	ERR_MGW_MONTH_LIMIT = 26,
	ERR_MGW_ERROR = 27,
	ERR_FAILED_TO_SEND_SMS = 28,
	ERR_MGW_OVERLOADED = 29,
	ERR_MAXIMUM_ITEMPRICE_REACHED = 30,
	ERR_TSID_NOT_FOUND = 31,
	ERR_UUID_NOT_FOUND = 32
}

export enum ValuTxtError {
	ERR_NOERROR = 'ERR_NOERROR',
	ERR_UNKNOWN_ERROR = 'ERR_UNKNOWN_ERROR',
	ERR_COM_EXCEPTION = 'ERR_COM_EXCEPTION',
	ERR_INVALID_PASSWORD = 'ERR_INVALID_PASSWORD',
	ERR_FORBIDDEN = 'ERR_FORBIDDEN',
	ERR_ITEM_LIST_EMPTY = 'ERR_ITEM_LIST_EMPTY',
	ERR_ITEM_LIST_NOT_EMPTY = 'ERR_ITEM_LIST_NOT_EMPTY',
	ERR_MAXIMUM_ITEMS_REACHED = 'ERR_MAXIMUM_ITEMS_REACHED',
	ERR_INVALID_UUID = 'ERR_INVALID_UUID',
	ERR_INVALID_MSISDN = 'ERR_INVALID_MSISDN',
	ERR_CHECK_OPERATOR = 'ERR_CHECK_OPERATOR',
	ERR_INVALID_LA = 'ERR_INVALID_LA',
	ERR_INVALID_TSID = 'ERR_INVALID_TSID',
	ERR_INVALID_MESSAGE = 'ERR_INVALID_MESSAGE',
	ERR_INVALID_MESSAGE_INIT = 'ERR_INVALID_MESSAGE_INIT',
	ERR_INVALID_MESSAGE_FINAL = 'ERR_INVALID_MESSAGE_FINAL',
	ERR_INVALID_PAGECODE = 'ERR_INVALID_PAGECODE',
	ERR_INVALID_PRICE = 'ERR_INVALID_PRICE',
	ERR_INVALID_QUANTITY = 'ERR_INVALID_QUANTITY',
	ERR_INVALID_VATRATE = 'ERR_INVALID_VATRATE',
	ERR_INVALID_VATRATEDESCRIPTION = 'ERR_INVALID_VATRATEDESCRIPTION',
	ERR_INVALID_DESCRIPTION = 'ERR_INVALID_DESCRIPTION',
	ERR_INVALID_CURRENCY = 'ERR_INVALID_CURRENCY',
	ERR_MISSING_DYNAMIC_PRICE = 'ERR_MISSING_DYNAMIC_PRICE',
	ERR_RESERVATION_NOT_ACTIVE = 'ERR_RESERVATION_NOT_ACTIVE',
	ERR_ALEADY_CANCELED = 'ERR_ALEADY_CANCELED',
	ERR_MGW_MONTH_LIMIT = 'ERR_MGW_MONTH_LIMIT',
	ERR_MGW_ERROR = 'ERR_MGW_ERROR',
	ERR_FAILED_TO_SEND_SMS = 'ERR_FAILED_TO_SEND_SMS',
	ERR_MGW_OVERLOADED = 'ERR_MGW_OVERLOADED',
	ERR_MAXIMUM_ITEMPRICE_REACHED = 'ERR_MAXIMUM_ITEMPRICE_REACHED',
	ERR_TSID_NOT_FOUND = 'ERR_TSID_NOT_FOUND',
	ERR_UUID_NOT_FOUND = 'ERR_UUID_NOT_FOUND'
}

export function mapValuErr(error: ValuTxtError): number {
	switch (error) {
		case ValuTxtError.ERR_NOERROR:
			return ValuError.ERR_NOERROR;
		case ValuTxtError.ERR_UNKNOWN_ERROR:
			return ValuError.ERR_UNKNOWN_ERROR;
		case ValuTxtError.ERR_COM_EXCEPTION:
			return ValuError.ERR_COM_EXCEPTION;
		case ValuTxtError.ERR_INVALID_PASSWORD:
			return ValuError.ERR_INVALID_PASSWORD;
		case ValuTxtError.ERR_FORBIDDEN:
			return ValuError.ERR_FORBIDDEN;
		case ValuTxtError.ERR_ITEM_LIST_EMPTY:
			return ValuError.ERR_ITEM_LIST_EMPTY;
		case ValuTxtError.ERR_ITEM_LIST_NOT_EMPTY:
			return ValuError.ERR_ITEM_LIST_NOT_EMPTY;
		case ValuTxtError.ERR_MAXIMUM_ITEMS_REACHED:
			return ValuError.ERR_MAXIMUM_ITEMS_REACHED;
		case ValuTxtError.ERR_INVALID_UUID:
			return ValuError.ERR_INVALID_UUID;
		case ValuTxtError.ERR_INVALID_MSISDN:
			return ValuError.ERR_INVALID_MSISDN;
		case ValuTxtError.ERR_CHECK_OPERATOR:
			return ValuError.ERR_CHECK_OPERATOR;
		case ValuTxtError.ERR_INVALID_LA:
			return ValuError.ERR_INVALID_LA;
		case ValuTxtError.ERR_INVALID_TSID:
			return ValuError.ERR_INVALID_TSID;
		case ValuTxtError.ERR_INVALID_MESSAGE:
			return ValuError.ERR_INVALID_MESSAGE;
		case ValuTxtError.ERR_INVALID_MESSAGE_INIT:
			return ValuError.ERR_INVALID_MESSAGE_INIT;
		case ValuTxtError.ERR_INVALID_MESSAGE_FINAL:
			return ValuError.ERR_INVALID_MESSAGE_FINAL;
		case ValuTxtError.ERR_INVALID_PAGECODE:
			return ValuError.ERR_INVALID_PAGECODE;
		case ValuTxtError.ERR_INVALID_PRICE:
			return ValuError.ERR_INVALID_PRICE;
		case ValuTxtError.ERR_INVALID_QUANTITY:
			return ValuError.ERR_INVALID_QUANTITY;
		case ValuTxtError.ERR_INVALID_VATRATE:
			return ValuError.ERR_INVALID_VATRATE;
		case ValuTxtError.ERR_INVALID_VATRATEDESCRIPTION:
			return ValuError.ERR_INVALID_VATRATEDESCRIPTION;
		case ValuTxtError.ERR_INVALID_DESCRIPTION:
			return ValuError.ERR_INVALID_DESCRIPTION;
		case ValuTxtError.ERR_INVALID_CURRENCY:
			return ValuError.ERR_INVALID_CURRENCY;
		case ValuTxtError.ERR_MISSING_DYNAMIC_PRICE:
			return ValuError.ERR_MISSING_DYNAMIC_PRICE;
		case ValuTxtError.ERR_RESERVATION_NOT_ACTIVE:
			return ValuError.ERR_RESERVATION_NOT_ACTIVE;
		case ValuTxtError.ERR_ALEADY_CANCELED:
			return ValuError.ERR_ALEADY_CANCELED;
		case ValuTxtError.ERR_MGW_MONTH_LIMIT:
			return ValuError.ERR_MGW_MONTH_LIMIT;
		case ValuTxtError.ERR_MGW_ERROR:
			return ValuError.ERR_MGW_ERROR;
		case ValuTxtError.ERR_FAILED_TO_SEND_SMS:
			return ValuError.ERR_FAILED_TO_SEND_SMS;
		case ValuTxtError.ERR_MGW_OVERLOADED:
			return ValuError.ERR_MGW_OVERLOADED;
		case ValuTxtError.ERR_MAXIMUM_ITEMPRICE_REACHED:
			return ValuError.ERR_MAXIMUM_ITEMPRICE_REACHED;
		case ValuTxtError.ERR_TSID_NOT_FOUND:
			return ValuError.ERR_TSID_NOT_FOUND;
		case ValuTxtError.ERR_UUID_NOT_FOUND:
			return ValuError.ERR_UUID_NOT_FOUND;
		default:
			return 0;
	}
}*/
