// Angular
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";

import {  Observable, Subscription } from "rxjs";
// NGRX
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../../core/reducers";
// Layout
import {
	SubheaderService,
	LayoutConfigService,
} from "../../../../../core/_base/layout";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../../core/_base/crud";
import {
	selectWaterTransactionActionLoading,
	selectWaterTransactionById,
} from "../../../../../core/water/transaction/transaction.selector";
import { WaterTransactionModel } from "../../../../../core/water/transaction/transaction.model";
import { WaterMeterService } from "../../../../../core/water/meter/meter.service";
import { SelectionModel } from "@angular/cdk/collections";
import { QueryWaterMeterModel } from "../../../../../core/water/meter/querymeter.model";

import * as _moment from "moment";
import { default as _rollupMoment} from "moment";
import { WaterTransactionService } from "../../../../../core/water/transaction/transaction.service";
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../../../environments/environment";
const moment = _rollupMoment || _moment;

@Component({
	selector: "kt-edit-transaction",
	templateUrl: "./edit-transaction.component.html",
	styleUrls: ["./edit-transaction.component.scss"],
})
export class EditTransactionComponent implements OnInit, OnDestroy {
	waterTransaction: WaterTransactionModel;
	waterTransactionId$: Observable<string>;
	oldWaterTransaction: WaterTransactionModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	waterTransactionForm: FormGroup;
	hasFormErrors = false;
	waterTransactionResult: any[] = [];
	waterMeter: any[] = [];
	selection = new SelectionModel<WaterTransactionModel>(true, []);
	date = new FormControl(moment());
	checker : boolean;
	buttonSave : boolean = true;
	loadingForm: boolean 
	images: any;
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
		private layoutConfigService: LayoutConfigService,
		private http : HttpClient,
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
								this.loadingForm = true
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
		this.hiddenAfterRes()
		this.getImage();
	}


	hiddenAfterRes(){
	if (this.waterTransaction.checker != false){
			this.buttonSave = true;
		}else{
			this.buttonSave = false;
		}
	}


	createForm() {
		if (this.waterTransaction._id) {
			this.loadMeterList();
			this.waterTransactionForm = this.waterTransactionFB.group({
				wat: [{value:this.waterTransaction.wat._id, disabled:true}],
				rate: [
					{
						value: this.waterTransaction.wat.rte.rte,
						disabled: true,
					},
				],
				strtpos: [{"value": this.waterTransaction.strtpos, "disabled":true},Validators.required],
				endpos: [this.waterTransaction.endpos, Validators.required],
				billmnt: [this.waterTransaction.billmnt, Validators.required],
				billamn: [
					{ value: this.waterTransaction.billamnt, disabled: true },
					Validators.required,
				],
				unit : [this.waterTransaction.unit],
				air_kotor: [this.waterTransaction.air_kotor],
				strtpos2: [{value:this.waterTransaction.strtpos2, disabled:true}],
				endpos2: [{value:this.waterTransaction.endpos2, disabled:true}],
				checker : [""],
				watname : [this.waterTransaction.watname]
			});
		}
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
		this.updateWaterTransaction(editedWaterTransaction, withBack);
		
	}
	prepareWaterTransaction(): WaterTransactionModel {
		const controls = this.waterTransactionForm.controls;
		const _waterTransaction = new WaterTransactionModel();
		_waterTransaction.clear();
		_waterTransaction._id = this.waterTransaction._id;
		_waterTransaction.wat = controls.wat.value;
		_waterTransaction.strtpos = controls.strtpos.value;
		_waterTransaction.endpos = controls.endpos.value;
		_waterTransaction.strtpos2 = controls.strtpos2.value;
		_waterTransaction.endpos2 = controls.endpos2.value;
		_waterTransaction.billmnt = controls.billmnt.value;
		_waterTransaction.billamnt = controls.billamn.value;
		_waterTransaction.air_kotor = controls.air_kotor.value;
		_waterTransaction.unit = controls.unit.value.toLowerCase();
		_waterTransaction.checker = controls.checker.value;
		_waterTransaction.watname = controls.watname.value.toLowerCase();

		return _waterTransaction;
	}



	updateWaterTransaction(
		_waterTransaction: WaterTransactionModel,
		withBack: boolean = false
	) {
		const addSubscription = this.service
			.updateWaterTransaction(_waterTransaction)
			.subscribe(
				(res) => {
					const message = `Water consumption successfully has been saved.`;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						true
					);
					const url = `/water-management/water/transaction`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
				},
				(err) => {
					console.error(err);
					const message =
						"Error while saving water consumption | " +
						err.statusText;
					this.layoutUtilsService.showActionNotification(
						message,
						MessageType.Create,
						5000,
						true,
						false
					);
				}
			);
		this.subscriptions.push(addSubscription);
	}
	getComponentTitle() {
		let result = `Edit Water Consumption`;
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

	async loadMeterList() {
		this.selection.clear();
		const queryParams = new QueryWaterMeterModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceWaterrMeter
			.getListWaterMeter(queryParams)
			.subscribe((res) => {
				this.waterMeter = res.data;

				this.loadingForm = false
				document.body.style.height = "101%"
				window.scrollTo(0, 1);
				document.body.style.height = ""
			});
	}
	
	changeWaterMeter(item) {
		this.serviceWaterrMeter.getWaterMeter(item).subscribe((res) => {
			this.waterTransactionForm.controls.rate.setValue(res.data.rte.rte);
			this.waterTransactionForm.controls.watname.setValue(res.data.nmmtr);
			this.waterTransactionForm.controls.strtpos.setValue(
				res.lastConsumtion.endpos
			);
		});
	}

	changeMeterPost() {
		const strtpos = this.waterTransactionForm.controls.strtpos.value / 100;
		if(strtpos != 0){
			this.waterTransactionForm.controls.strtpos2.setValue(strtpos)
		}
		const endpos = this.waterTransactionForm.controls.endpos.value / 100;
		if (endpos != 0){
			this.waterTransactionForm.controls.endpos2.setValue(endpos)
		}
		const rate = this.waterTransactionForm.controls.rate.value;
		if (strtpos !==0 || endpos !== 0 && rate !== "") {

			if ((endpos - strtpos) <= 2){
				this.waterTransactionForm.controls.billamn.setValue(
					40000
				);
			}else{
			this.waterTransactionForm.controls.billamn.setValue(
				Math.round(((endpos - strtpos) * rate) / 100)*100);
			}
		}
	}


	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	async getImage(){
		const URL_IMAGE = `${environment.baseAPI}/api/water/transaksi`
		await this.http.get(`${URL_IMAGE}/${this.waterTransaction._id}/getimages`).subscribe((res: any) => {
				this.images = res.data;
		 });
	}
}
