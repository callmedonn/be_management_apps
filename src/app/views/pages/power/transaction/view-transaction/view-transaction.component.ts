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
const moment = _rollupMoment || _moment;
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../../../environments/environment";

@Component({
	selector: "kt-view-transaction",
	templateUrl: "./view-transaction.component.html",
	styleUrls: ["./view-transaction.component.scss"],
})
export class ViewTransactionComponent implements OnInit, OnDestroy {
	powerTransaction: PowerTransactionModel;
	powerTransactionId$: Observable<string>;
	oldPowerTransaction: PowerTransactionModel;
	selectedTab = 0;
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
	buttonSave : boolean = true;
	loadingForm : boolean
	images: any;
	
	
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private powerTransactionFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private http : HttpClient,
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
								this.loadingForm = true;
								this.powerTransaction = res;
								this.checker = res.checker;
								this.oldPowerTransaction = Object.assign(
									{},
									this.powerTransaction
								);
								this.initPowerTransaction();
							}
						});
				}
			}
		);
		this.subscriptions.push(routeSubscription);
	}
	initPowerTransaction() {
		this.createForm();
		this.loadMeterList();
		this.getImage();
	}


	createForm() {
		if (this.powerTransaction._id) {
			this.powerTransactionForm = this.powerTransactionFB.group({
				pow: [{"value":this.powerTransaction.pow._id, disabled:true }],
				loss: [{"value":this.powerTransaction.loss, disabled:true}],
				rate: [
					{
						value: this.powerTransaction.pow.rte.rte,
						disabled: true,
					},
				],
				strtpos: [{"value":this.powerTransaction.strtpos,"disabled":true}],
				endpos: [{value:this.powerTransaction.endpos, disabled:true}],
				strtpos2: [{"value":this.powerTransaction.strtpos2,"disabled":true}],
				endpos2: [{"value":this.powerTransaction.endpos2,"disabled":true}],
				billmnt: [{value:this.powerTransaction.billmnt, disabled:true}],
				billamn: [
					{ value: this.powerTransaction.billamnt, disabled: true },
				],
				checker:[{value:this.powerTransaction.checker, disabled:true}],
				powname : [{value:this.powerTransaction.powname, disabled:true}],
			});
		} 
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

		url = `/power-management/power/transaction/view/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	
	getComponentTitle() {
		let result = `View Electricity Consumption`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	
	async loadMeterList() {
		this.selection.clear();
		const queryParams = new QueryPowerMeterModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.servicePowerMeter.getListPowerMeter(queryParams).subscribe((res) => {
				this.powerMeter = res.data;
				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""


			});
	}

	changePowerMeter(item) {
		this.servicePowerMeter.getPowerMeter(item).subscribe((res) => {
			console.log(item)
			this.powerTransactionForm.controls.rate.setValue(res.data.rte.rte);
			this.powerTransactionForm.controls.powname.setValue(res.data.nmmtr);
			this.powerTransactionForm.controls.strtpos.setValue(res.lastConsumtion.endpos);
			console.log(res)
			const strtpos = this.powerTransactionForm.controls.strtpos.value / 10;
			if (strtpos !== 0){
				this.powerTransactionForm.controls.strtpos2.setValue(
					strtpos);
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

	async getImage(){
		const URL_IMAGE = `${environment.baseAPI}/api/power/transaksi`
		await this.http.get(`${URL_IMAGE}/${this.powerTransaction._id}/getimages`).subscribe((res: any) => {
				this.images = res.data;
		 });
	}
}
