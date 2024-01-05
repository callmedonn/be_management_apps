import {BaseModel} from '../../_base/crud';



export class TaxModel extends BaseModel{
	_id : string;
	taxName : string;
	tax :string;
	remarks: string;
	createdBy: string;



	clear(): void{
		this._id = undefined;
		this.taxName = "";
		this.tax = "";
		this.remarks = "";
		this.createdBy = localStorage.getItem("user");
	}
}
