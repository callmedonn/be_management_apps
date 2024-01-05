// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../core/_base/crud';
import {
	selectLastCreatedBillingId,
	selectBillingActionLoading,
	selectBillingById
} from "../../../../core/billing/billing.selector";
import {BillingOnServerCreated, BillingUpdated} from "../../../../core/billing/billing.action";
import {BillingModel} from '../../../../core/billing/billing.model';
import {BillingService} from '../../../../core/billing/billing.service';
import {SelectionModel} from "@angular/cdk/collections";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker} from '@angular/material';
import * as _moment from 'moment';
import {default as _rollupMoment, Moment} from 'moment';
import {CustomerService} from '../../../../core/customer/customer.service';
import {UnitService} from '../../../../core/unit/unit.service';
import {QueryUnitModel} from '../../../../core/unit/queryunit.model';
import {PowerTransactionService} from '../../../../core/power/transaction/transaction.service';
import {WaterTransactionService} from '../../../../core/water/transaction/transaction.service';
import { QueryAccountBankModel } from '../../../../core/masterData/bank/accountBank/queryaccountBank.model';
import { AccountBankService } from '../../../../core/masterData/bank/accountBank/accountBank.service';
import { PowerMeterService } from '../../../../core/power';
import { WaterMeterService } from '../../../../core/water/meter/meter.service';
const moment = _rollupMoment || _moment;


@Component({
  selector: 'kt-view-billing',
  templateUrl: './view-billing.component.html',
  styleUrls: ['./view-billing.component.scss']
})
export class ViewBillingComponent implements OnInit, OnDestroy {
	poweruser : number;
	hasilppju : number;
	hasilsc : number;
	hasiltotal : number;
	datappju : number;
	datasc : number;
	type;

	wateruser : number;
	hasilwateramount : number;

	invoicenumber: any;
	billing: BillingModel;
	billingId$: Observable<string>;
	oldBilling: BillingModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	billingForm: FormGroup;
	hasFormErrors = false;
	unitResult: any[] = [];
	customerResult: any[] = [];
	powerResult: any[] = [];
	waterResult: any[] = [];
	bankResult: any[] = [];
	selection = new SelectionModel<BillingModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	serializedDate = new FormControl((new Date()).toISOString());
	duedate = new FormControl();
	// Private properties
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private billingFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private serviceBill: BillingService,
		private serviceCustomer: CustomerService,
		private serviceUnit: UnitService,
		private bservice : AccountBankService,
		private powerMasterService : PowerMeterService,
		private waterMasterService : WaterMeterService,
		private layoutConfigService: LayoutConfigService,
		private powerservice : PowerTransactionService,
		private waterservice : WaterTransactionService
	) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectBillingActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectBillingById(id))).subscribe(res => {
					if (res) {
						this.billing = res;
						this.oldBilling = Object.assign({}, this.billing);
						this.initBilling();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initBilling() {
		this.createForm();
		this.loadUnit();
		this.loadPower(this.billing.unit._id);
		this.loadWater(this.billing.unit._id);
		this.loadMasterPower(this.billing.unit.pwrmtr);
		this.loadMasterWater(this.billing.unit.wtrmtr);
		this.getDataElectricity(this.billing.billing.electricity.electric_trans._id);
		this.getDataWater(this.billing.billing.water.water_trans);
		console.log(this.billing.billing.water.water_trans);
		this.loadAccountBank()
	}

	createForm() {
			this.billingForm = this.billingFB.group({
				billed_to: [{value:this.billing.billed_to, disabled:true}],
				unit: [{value:this.billing.unit._id, disabled:true}],
				unit2: [{value:this.billing.unit2, disabled:true}],
				billing_number: [{value: this.billing.billing_number, disabled: true}],
				created_date: [{"value":this.billing.created_date, "disabled": true}],
				billing_date: [{value:this.billing.billing_date, disabled:true}],
				due_date: [{value:this.billing.due_date, disabled:true}],
				billing: this.billingFB.group({
					ipl: this.billingFB.group({
						amountipl: [{value:this.billing.billing.ipl.amountipl, disabled:true}],
					}),
					service_charge: this.billingFB.group({
						amount: [{value:this.billing.billing.service_charge.amount , disabled:true}],
					}),
					sinkingfund: this.billingFB.group({
						amountsink: [{value:this.billing.billing.sinkingfund.amountsink, disabled:true}],
					}),
					electricity: this.billingFB.group({
						electric_trans: [{value:this.billing.billing.electricity.electric_trans._id, disabled:true}],
					}),
					water: this.billingFB.group({
						water_trans: [{value:this.billing.billing.water.water_trans, disabled:true}]
					})
				}),
				start : [{value:"", disabled:true}],
				end : [{value:"", disabled:true}],
				poweruse : [{value:this.poweruser, disabled:true}],
				ppju : [{value:"", disabled:true}],
				totalppju : [{value:"", disabled:true}],
				servicecharge : [{value:"", disabled:true}],
				totalsc : [{value:"", disabled:true}],
				loss : [{value:"", disabled:true}],
				totalloss : [{value:"", disabled:true}],
				totalconsumption : [{value:"", disabled:true}],
				
				startw : [{value:"", disabled:true}],
				endw : [{value:"", disabled:true}],
				wateruse : [{value:this.wateruser, disabled:true}],
				pemeliharaan : [{value:"", disabled:true}],
				administrasi : [{value:"", disabled:true}],
				air_kotor : [{value:"", disabled:true}],
				totaldt : [{value:"", disabled:true}],
				totalconsumptionwater : [{value:"", disabled:true}],
				
				bank : [{value:this.billing.bank, disabled:true}],
				customerBankNo : [{value:this.billing.customerBankNo, disabled:true}],
				customerBank : [{value:this.billing.customerBank, disabled:true}],
				desc : [{value:this.billing.desc, disabled:true}],
				paidDate :  [{value:this.billing.paidDate, disabled:true}],
				isPaid : [true],
				paymentType :  [{value:this.billing.paymentType, disabled:true}],
			});
	}


	loadUnit(){
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			"grpnm",
			1,
			10
		);
		this.serviceUnit.getDataUnitForParking(queryParams).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}

	loadPower(unitid){
		this.powerservice.getPowerTransactionUnit(unitid).subscribe(
			res => {
				this.powerResult = res.data;
			}
		);
	}

	getDataElectricity(id){
		this.powerservice.findPowbillById(id).subscribe(
			res => {
				this.poweruser = res.data.billamnt
				const controls = this.billingForm.controls;
				controls.start.setValue(res.data.strtpos2);
				controls.end.setValue(res.data.endpos2);
				controls.poweruse.setValue(this.poweruser);
				controls.loss.setValue(res.data.loss);
				this.transaksiPower();
			})
	}

	loadMasterPower(id){
		const controls = this.billingForm.controls;
		this.powerMasterService.getPowerMeter(id).subscribe(
			res => {
				console.log(res);
				controls.ppju.setValue(res.data.rte.ppju);
				controls.servicecharge.setValue(res.data.rte.srvc);
			})
	}

	transaksiPower(){
		const powerusenum = this.billingForm.controls.poweruse.value
		const ppjunum  = this.billingForm.controls.ppju.value
		if (powerusenum !== null && ppjunum  !== null){
			this.datappju = (powerusenum / 100) * ppjunum
			this.billingForm.controls.totalppju.setValue(this.datappju);
			this.hasilppju = powerusenum + this.datappju;
		}

		const scjunum = this.billingForm.controls.servicecharge.value
		if (scjunum !== null ){
			this.datasc = (this.hasilppju / 100) * scjunum
			this.billingForm.controls.totalsc.setValue(this.datasc);
			this.hasilsc = this.datasc + this.hasilppju;
		}

		const lossnum = this.billingForm.controls.loss.value;
		if (lossnum !== null ){
			const dataloss = (this.hasilsc / 100) * lossnum
			this.billingForm.controls.totalloss.setValue(dataloss);
			this.hasiltotal = this.datappju + this.datasc + dataloss + powerusenum
			this.billingForm.controls.totalconsumption.setValue(this.hasiltotal);
		}
	}
	
	loadWater(unitid){
		this.waterservice.getWaterTransactionUnit(unitid).subscribe(
			res => {
				this.waterResult = res.data;
			}
		);
	}

	getDataWater(id){
		this.waterservice.findWaterbillById(id).subscribe(
			res => {
				this.wateruser = res.data.billamnt
				const controls = this.billingForm.controls;
				controls.startw.setValue(res.data.strtpos2);
				controls.endw.setValue(res.data.endpos2);
				controls.wateruse.setValue(this.wateruser);
				controls.air_kotor.setValue(res.data.air_kotor);

				this.transaksiWater();
			})
			
	}

	loadMasterWater(id){
		this.waterMasterService.getWaterMeter(id).subscribe(
			res => {
				const controls = this.billingForm.controls;
				controls.pemeliharaan.setValue(res.data.rte.pemeliharaan);
				controls.administrasi.setValue(res.data.rte.administrasi);
			})
	}


	transaksiWater(){
		const wateramount = this.billingForm.controls.wateruse.value;
		const maintenanceamount  = this.billingForm.controls.pemeliharaan.value
		const administrationamount  = this.billingForm.controls.administrasi.value
		if (maintenanceamount !== null){
			this.hasilwateramount = wateramount + maintenanceamount + administrationamount
		}
		
		const dw = this.billingForm.controls.air_kotor.value;
		if (dw !== null ){
			const dwres = (this.hasilwateramount / 100) * dw
			this.billingForm.controls.totaldt.setValue(dwres);
			const allwateramount = this.hasilwateramount + dwres
			this.billingForm.controls.totalconsumptionwater.setValue(allwateramount);
		}
	}

	loadAccountBank() {
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.bservice.getListAccountBank(queryParams).subscribe(
			res => {
				this.bankResult = res.data;
			}
		);
	}

	goBackWithId() {
		const url = `/billing`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}
	refreshBilling(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/billing/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.billingForm.controls;
		/** check form */
		if (this.billingForm.invalid) {
			console.log(controls);
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedBilling = this.prepareBilling();
		this.updateBilling(editedBilling, withBack);
	}
	
	prepareBilling(): BillingModel {
		const controls = this.billingForm.controls;
		const _billing = new BillingModel();
		_billing.clear();
		_billing._id = this.billing._id;
		_billing.billed_to = controls.billed_to.value.toLowerCase();
		_billing.unit = controls.unit.value;
		_billing.unit2 = controls.unit2.value.toLowerCase();
		_billing.billing_number = controls.billing_number.value;
		_billing.created_date = controls.created_date.value;
		_billing.billing_date = controls.billing_date.value;
		_billing.due_date = controls.due_date.value;
		_billing.billing = {
			service_charge: {
				amount: controls.billing.get('service_charge')['controls'].amount.value
			},
			sinkingfund: {
				amountsink: controls.billing.get('sinkingfund')['controls'].amountsink.value
			},
			ipl: {
				amountipl: controls.billing.get('ipl')['controls'].amountipl.value
			},
			electricity: {
				electric_trans: controls.billing.get('electricity')['controls'].electric_trans.value
			},
			water: {
				water_trans: controls.billing.get('water')['controls'].water_trans.value
			},
		};
		_billing.bank = controls.bank.value;
		_billing.isPaid = controls.isPaid.value;
		_billing.customerBank = controls.customerBank.value;
		_billing.customerBankNo = controls.customerBankNo.value;
		_billing.desc = controls.desc.value;
		_billing.paidDate = controls.paidDate.value;
		return _billing;
	}
	updateBilling(_billing: BillingModel, withBack: boolean = false){
		const editSubscription = this.serviceBill.updateBilling(_billing).subscribe(
			res => {
				const message = `Billing successfully has been saved.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
				const url = `/billing`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while saving billing | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, false);
			}
		);
		this.subscriptions.push(editSubscription);
	}

	getComponentTitle() {
		let result = `View Billing`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
