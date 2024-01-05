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
	selectLastCreatedWaterTransactionId,
	selectWaterTransactionActionLoading,
	selectWaterTransactionById,
} from "../../../../../core/water/transaction/transaction.selector";
import {
	WaterTransactionOnServerCreated,
	WaterTransactionUpdated,
} from "../../../../../core/water/transaction/transaction.action";
import { WaterTransactionModel } from "../../../../../core/water/transaction/transaction.model";
import { WaterMeterService } from "../../../../../core/water/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryWaterMeterModel } from "../../../../../core/water/meter/querymeter.model";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
	MatDatepicker,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { WaterTransactionService } from "../../../../../core/water/transaction/transaction.service";
import { OwnershipContractService } from '../../../../../core/contract/ownership/ownership.service';
import { LeaseContractService } from '../../../../../core/contract/lease/lease.service';
const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-add-transaction",
	templateUrl: "./add-transaction.component.html",
	styleUrls: ["./add-transaction.component.scss"],
})
export class AddTransactionComponent implements OnInit, OnDestroy {
	waterTransaction: WaterTransactionModel;
	waterTransactionId$: Observable<string>;
	oldWaterTransaction: WaterTransactionModel;
	selectedTab = 0;
	lastdata : any;
	unit : string;
	type : string;
	status : any;
	loading$: Observable<boolean>;
	waterTransactionForm: FormGroup;
	hasFormErrors = false;
	waterTransactionResult: any[] = [];
	waterMeter: any[] = [];
	date1 = new FormControl(new Date());
	selection = new SelectionModel<WaterTransactionModel>(true, []);
	date = new FormControl(moment());
	checker : boolean;
	loading : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private waterTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceWaterrMeter: WaterMeterService,
		private ownerService: OwnershipContractService,
		private tenantService: LeaseContractService,
		private layoutConfigService: LayoutConfigService,
		private service: WaterTransactionService
	) {}

	ngOnInit() {
		this.loading$ = this.store.pipe(
			select(selectWaterTransactionActionLoading)
		);
		const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id) {
					this.store
						.pipe(select(selectWaterTransactionById(id)))
						.subscribe((res) => {
							if (res) {
								this.waterTransaction = res;
								this.checker = res.checker;
								this.oldWaterTransaction = Object.assign(
									{},
									this.waterTransaction
								);
								this.initWaterTransaction();
							}
						});
				} else {
					this.waterTransaction = new WaterTransactionModel();
					this.waterTransaction.clear();
					this.initWaterTransaction();
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initWaterTransaction() {
		this.createForm();
		
	}
	createForm() {
			this.loadMeterList();
			this.waterTransactionForm = this.waterTransactionFB.group({
				wat: ["", Validators.required],
				rate: [{ value: "", disabled: true }, Validators.required],
				strtpos: ["", Validators.required],
				strtpos2: [{value:"", disabled:true}],
				endpos: ["", Validators.required],
				endpos2: [{value:"", disabled:true}],
				billmnt: [{value : this.date1.value, disabled:false}, Validators.required],
				billamn: [{ value: "", disabled: true }, Validators.required],
				unit: [""],
				air_kotor: ["", Validators.required],
				checker:[""],
				watname:[""],
			});
	}
	goBackWithId() {
		const url = `/water-management/water/transaction`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshWaterTransaction(isNew: boolean = false, id: string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/water-management/water/transaction/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.waterTransactionForm.controls;
		/** check form */
		if (this.waterTransactionForm.invalid) {
			console.log(controls);
			Object.keys(controls).forEach((controlName) =>
				controls[controlName].markAsTouched()
			);
			
			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}
		this.loading = true;
		const editedWaterTransaction = this.prepareWaterTransaction();
		this.addWaterTransaction(editedWaterTransaction, withBack);
	}
	prepareWaterTransaction(): WaterTransactionModel {
		const controls = this.waterTransactionForm.controls;
		const _waterTransaction = new WaterTransactionModel();
		_waterTransaction.clear();
		_waterTransaction._id = this.waterTransaction._id;
		_waterTransaction.wat = controls.wat.value;
		_waterTransaction.strtpos = controls.strtpos.value;
		_waterTransaction.strtpos2 = controls.strtpos2.value;
		_waterTransaction.endpos2 = controls.endpos2.value;
		_waterTransaction.endpos = controls.endpos.value;
		_waterTransaction.billmnt = controls.billmnt.value;
		_waterTransaction.billamnt = controls.billamn.value;
		_waterTransaction.air_kotor = controls.air_kotor.value;
		_waterTransaction.unit = controls.unit.value.toLowerCase();
		_waterTransaction.checker = controls.checker.value;
		_waterTransaction.watname = controls.watname.value.toLowerCase();
		return _waterTransaction;
	}


	addWaterTransaction(_waterTransaction: WaterTransactionModel,withBack: boolean = false) 
	{
		const addSubscription = this.service.createWaterTransaction(_waterTransaction).subscribe(
				(res) => {
					const message = `New water consumption successfully has been added.`;
					this.layoutUtilsService.showActionNotification(message,MessageType.Create,5000,true,true);
					
					if (_waterTransaction.checker != true){
						const url = `/water-management/water/transaction/new`;
						this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
						}else{
						const url2 = `/water-management/water/transaction`;
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
		let result = "Create Water Consumption";
		if (!this.waterTransaction || !this.waterTransaction._id) {
			return result;
		}

		result = `Edit Water Consumption`;
		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	reset() {
		this.waterTransaction = Object.assign({}, this.oldWaterTransaction);
		this.createForm();
		this.hasFormErrors = false;
		this.waterTransactionForm.markAsPristine();
		this.waterTransactionForm.markAsUntouched();
		this.waterTransactionForm.updateValueAndValidity();
	}

	loadMeterList() {
		this.selection.clear();
		const queryParams = new QueryWaterMeterModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceWaterrMeter
			.getListWaterMeterforTr(queryParams)
			.subscribe((res) => {
				this.waterMeter = res.data;
			});
	}
	
	async changeWaterMeter(item) {
		await this.serviceWaterrMeter.getWaterMeter(item).subscribe(res => {
			this.waterTransactionForm.controls.rate.setValue(res.data.rte.rte);
			this.waterTransactionForm.controls.watname.setValue(res.data.nmmtr)
			
			if (typeof res.lastConsumtion == "undefined" || res.lastConsumtion == null){
				this.lastdata = 0
				console.log(this.lastdata, "APATUCH")
			}else{
				this.lastdata = res.lastConsumtion.endpos;
				console.log(this.lastdata, "BENERTUCH")
			}

			this.unit = res.data.unt._id;
			this.type = res.data.unt.type;
	
			if (this.type == "pp" || this.type == "owner")	
				{
					this.ownerService.findOwnershipContractByUnit(this.unit).subscribe(data =>
						{
							if (data.data[0].billstatus == 0){
								this.waterTransactionForm.controls.strtpos.setValue(data.data[0].start_water_stand)
								console.log(data.data[0]);
								
								const strtpos = this.waterTransactionForm.controls.strtpos.value / 1000;
								if(strtpos != 0){
								this.waterTransactionForm.controls.strtpos2.setValue(strtpos)};
							}else{
								this.waterTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos)
								const strtpos = this.waterTransactionForm.controls.strtpos.value / 1000;
								if(strtpos != 0){
								this.waterTransactionForm.controls.strtpos2.setValue(strtpos)};
							}
						})
				}
			else{
					this.tenantService.findLeaseContractByUnit(this.unit).subscribe(data =>
						{
							if (data.data[0].billstatus == 0){
								this.waterTransactionForm.controls.strtpos.setValue(data.data[0].start_water_stand)
								const strtpos = this.waterTransactionForm.controls.strtpos.value / 1000;
								if(strtpos != 0){
								this.waterTransactionForm.controls.strtpos2.setValue(strtpos)};
							}else{
								this.waterTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos)
								const strtpos = this.waterTransactionForm.controls.strtpos.value / 1000;
								if(strtpos != 0){
								this.waterTransactionForm.controls.strtpos2.setValue(strtpos)};
							}
						})
				}
			});
	}

	changeMeterPost() {
		const strtpos = this.waterTransactionForm.controls.strtpos.value / 1000;
		if(strtpos != 0){
			this.waterTransactionForm.controls.strtpos2.setValue(strtpos)
		}
		const endpos = this.waterTransactionForm.controls.endpos.value / 1000;
		if (endpos != 0){
			this.waterTransactionForm.controls.endpos2.setValue(endpos)
		}
		const rate = this.waterTransactionForm.controls.rate.value;
		if (endpos !== 0 && rate !== 0) {
			if ((endpos - strtpos) <= 2){
				this.waterTransactionForm.controls.billamn.setValue(
					40000
				);
			}else{
			this.waterTransactionForm.controls.billamn.setValue(
				Math.fround((endpos - strtpos) * rate).toFixed(2));
			}
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
}
