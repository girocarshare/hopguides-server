import { dbField } from "../../db/decorators";

export class GeneratedVoucher {

    constructor(voucherId, voucherCode) {
        this.voucherId = voucherId;
        this.voucherCode = voucherCode;
    }

    @dbField()
    voucherId: string;

    @dbField()
    voucherCode: string;    
    
    @dbField()
    voucherUsed: boolean = false;
}