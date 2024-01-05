import {BaseModel} from '../_base/crud';
import {CustomerModel} from '../customer/customer.model';
import {UnitModel} from '../unit/unit.model';
import { OwnershipContractModel } from '../contract/ownership/ownership.model';
import { BankModel } from '../masterData/bank/bank/bank.model';

export class BillingModel extends BaseModel {
	_id : string;
	billing_number : string;
	contract : OwnershipContractModel;
	unit : UnitModel;
	billing : any;
	billed_to : string;
	created_date : string;
	unit2: string;
	billing_date : string;
	due_date : string;
	totalBilling : Number;


	bank: BankModel;
	customerBankNo : String;
	customerBank: String;
	desc: String;
	paidDate: String;
	isPaid : boolean;
	paymentType : string;

	pinalty : number;

	clear(): void {
		this._id = undefined;
		this.billing_number = "";
		this.billing = undefined;
		this.unit = undefined;
		this.contract = undefined;
		this.unit2 = "";
		this.billed_to = "";
		this.created_date = "";
		this.billing_date = "";
		this.due_date = "";
		this.totalBilling = 0;

		this.bank =undefined;
		this.customerBankNo = "";
		this.customerBank = "";
		this.desc = "";
		this.paidDate = "";
		this.isPaid = undefined;
		this.paymentType = "";

		this.pinalty = 0;
	}
}
