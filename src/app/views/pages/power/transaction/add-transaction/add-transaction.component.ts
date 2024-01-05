// Angular
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import {
	MomentDateAdapter,
	MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { Update } from "@ngrx/entity";
import { AppState } from "../../../../../core/reducers";
// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../../core/_base/crud";
import {
	selectLastCreatedPowerTransactionId,
	selectPowerTransactionActionLoading,
	selectPowerTransactionById,
} from "../../../../../core/power/transaction/transaction.selector";
import {
	PowerTransactionOnServerCreated,
	PowerTransactionUpdated,
} from "../../../../../core/power/transaction/transaction.action";
import { PowerTransactionModel } from "../../../../../core/power/transaction/transaction.model";
import { PowerMeterService } from "../../../../../core/power/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryPowerMeterModel } from "../../../../../core/power/meter/querymeter.model";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
	MatDatepicker,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { PowerTransactionService } from '../../../../../core/power/transaction/transaction.service';
import { LeaseContractService } from '../../../../../core/contract/lease/lease.service';
import { OwnershipContractService } from '../../../../../core/contract/ownership/ownership.service';
const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-add-transaction",
	templateUrl: "./add-transaction.component.html",
	styleUrls: ["./add-transaction.component.scss"],
})
export class AddTransactionComponent implements OnInit, OnDestroy {
	powerTransaction: PowerTransactionModel;
	powerTransactionId$: Observable<string>;
	oldPowerTransaction: PowerTransactionModel;
	selectedTab = 0;
	lastdata : any;
	unit : string;
	type : string;
	status : any;
	loading$: Observable<boolean>;
	powerTransactionForm: FormGroup;
	hasFormErrors = false;
	powerTransactionResult: any[] = [];
	powerMeter: any[] = [];
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	selection = new SelectionModel<PowerTransactionModel>(true, []);
	checker : boolean;
	loading  : boolean = false;
	
	
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private ownerService: OwnershipContractService,
		private tenantService: LeaseContractService,
		private service : PowerTransactionService,
		private servicePowerMeter: PowerMeterService,
		private layoutConfigService: LayoutConfigService
	) {}

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectPowerTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.store
						.pipe(select(selectPowerTransactionById(id)))
						.subscribe((res) => {
							if (res) {
								this.powerTransaction = res;
								this.checker = res.checker;
								this.oldPowerTransaction = Object.assign(
									{},
									this.powerTransaction
								);
								this.initPowerTransaction();
							}
						});
				} else {
					this.powerTransaction = new PowerTransactionModel();
					this.powerTransaction.clear();
					this.initPowerTransaction();
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initPowerTransaction() {
		this.createForm();	
		this.loadMeterList();
	}

	createForm() {
			this.powerTransactionForm = this.powerTransactionFB.group({
				pow: ["", Validators.required],
				rate: [{ value: "", disabled: true }, Validators.required],
				strtpos: ["", Validators.required],
				endpos: ["", Validators.required],
				strtpos2: [{value:"", disabled:true}],
				endpos2: [{value:"", disabled:true}],
				billmnt: [{value: this.date1.value, disabled: false}, Validators.required],
				billamn: [{ value: "", disabled: true }, Validators.required],
				loss: ["", Validators.required],
				checker:[""],
				powname:[""],
				unit :[""],
			});
	}
	goBackWithId() {
		const url = `/power-management/power/transaction`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshPowerTransaction(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/power-management/power/transaction/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.powerTransactionForm.controls;
		/** check form */
		if (this.powerTransactionForm.invalid) {
			console.log(controls);
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading = true;
		const editedPowerTransaction = this.preparePowerTransaction();
		this.addPowerTransaction(editedPowerTransaction, withBack);
	}
	preparePowerTransaction(): PowerTransactionModel {
		const controls = this.powerTransactionForm.controls;
		const _powerTransaction = new PowerTransactionModel();
		_powerTransaction.clear();
		_powerTransaction._id = this.powerTransaction._id;
		_powerTransaction.pow = controls.pow.value;
		_powerTransaction.strtpos = controls.strtpos.value;
		_powerTransaction.endpos = controls.endpos.value;
		_powerTransaction.strtpos2 = controls.strtpos2.value;
		_powerTransaction.endpos2 = controls.endpos2.value;
		_powerTransaction.billmnt = controls.billmnt.value;
		_powerTransaction.billamnt = controls.billamn.value;
		_powerTransaction.loss = controls.loss.value;
		_powerTransaction.unit = controls.unit.value.toLowerCase();
		_powerTransaction.checker = controls.checker.value;
		_powerTransaction.powname = controls.powname.value.toLowerCase();
		return _powerTransaction;
	}
	

	addPowerTransaction(_powerTransaction: PowerTransactionModel,withBack: boolean = false) 
	{
		const addSubscription = this.service.createPowerTransaction(_powerTransaction).subscribe(
				(res) => {
					const message = `New water consumption successfully has been added.`;
					this.layoutUtilsService.showActionNotification(message,MessageType.Create,5000,true,true);
					
					if (_powerTransaction.checker != true){
						const url = `/power-management/power/transaction/new`;
						this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
						}else{
						const url2 = `/power-management/power/transaction`;
						this.router.navigateByUrl(url2, { relativeTo: this.activatedRoute });
					}

				},
				(err) => {
					console.error(err);
					const message ="Error while adding water consumption | " + err.statusText;
					this.layoutUtilsService.showActionNotification(message,MessageType.Create,5000,true,false);
				}
			);
		this.subscriptions.push(addSubscription);
	}
	
	getComponentTitle() {
		let result = "Create Electricity Consumption ";
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	loadMeterList() {
		this.selection.clear();
		const queryParams = new QueryPowerMeterModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.servicePowerMeter.getListPowerMeterforTr(queryParams).subscribe((res) => {
				this.powerMeter = res.data;
			});
	}

	async changePowerMeter(item) {
		await this.servicePowerMeter.getPowerMeter(item).subscribe(res => {
			this.powerTransactionForm.controls.rate.setValue(res.data.rte.rte);
			this.powerTransactionForm.controls.powname.setValue(res.data.nmmtr);

			if (typeof res.lastConsumtion == "undefined" || res.lastConsumtion == null){
				this.lastdata = 0
				console.log(this.lastdata, "APATUCH")
			}else{
				this.lastdata = res.lastConsumtion.endpos;
				console.log(this.lastdata, "BENERTUCH")
			}

			// this.lastdata = res.lastConsumtion.endpos;
			this.unit = res.data.unt._id;
			this.type = res.data.unt.type
			;
			this.powerTransactionForm.controls.unit.setValue(res.data.unit);
			
			if (this.type == "pp" || this.type == "owner")	
				{
					this.ownerService.findOwnershipContractByUnit(this.unit).subscribe(data =>
						{
							if (data.data[0].billstatus == 0){
								this.powerTransactionForm.controls.strtpos.setValue(data.data[0].start_water_stand)
								console.log(data.data[0]);
								
								const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
								if(strtpos != 0){
								this.powerTransactionForm.controls.strtpos2.setValue(strtpos)};
							}else{
								this.powerTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos)
								const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
								if(strtpos != 0){
								this.powerTransactionForm.controls.strtpos2.setValue(strtpos)};
							}
						})
				}
			else{
					this.tenantService.findLeaseContractByUnit(this.unit).subscribe(data =>
						{
							if (data.data[0].billstatus == 0){
								this.powerTransactionForm.controls.strtpos.setValue(data.data[0].start_water_stand)
								const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
								if(strtpos != 0){
								this.powerTransactionForm.controls.strtpos2.setValue(strtpos)};
							}else{
								this.powerTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos)
								const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
								if(strtpos != 0){
								this.powerTransactionForm.controls.strtpos2.setValue(strtpos)};
							}
						})
				}
			});
	}

	
	changeMeterPost() {
		const strtpos = this.powerTransactionForm.controls.strtpos.value / 10; 
		if (strtpos !== 0){
			this.powerTransactionForm.controls.strtpos2.setValue(
				strtpos);
		}
		const endpos = this.powerTransactionForm.controls.endpos.value / 10;
		if (endpos !== 0){
			this.powerTransactionForm.controls.endpos2.setValue(
				endpos);
		}
		const rate = this.powerTransactionForm.controls.rate.value;
		if (endpos !== 0 && rate !== 0 ) {
			this.powerTransactionForm.controls.billamn.setValue(
				Math.fround((endpos - strtpos) * rate).toFixed(2));
		}
	}


	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
}
