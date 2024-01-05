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
const moment = _rollupMoment || _moment;
import {default as _rollupMoment, Moment} from 'moment';
import {CustomerService} from '../../../../core/customer/customer.service';
import {UnitService} from '../../../../core/unit/unit.service';
import {PowerTransactionService} from '../../../../core/power/transaction/transaction.service';
import {WaterTransactionService} from '../../../../core/water/transaction/transaction.service';
import { OwnershipContractService } from '../../../../core/contract/ownership/ownership.service';
import { LeaseContractService } from '../../../../core/contract/lease/lease.service';
import { QueryOwnerTransactionModel } from '../../../../core/contract/ownership/queryowner.model';
import { PowerMeterService } from '../../../../core/power';
import { WaterMeterService } from '../../../../core/water/meter/meter.service';



@Component({
  selector: 'kt-add-billing',
  templateUrl: './add-billing.component.html',
  styleUrls: ['./add-billing.component.scss']
})
export class AddBillingComponent implements OnInit, OnDestroy {
	codenum
	
	poweruser : number;
	hasilppju : number;
	hasilsc : number;
	hasiltotal : number;
	datappju : number;
	datasc : number;
	type;
	totalconsumption;
	billstats;

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
	selection = new SelectionModel<BillingModel>(true, []);
	date = new FormControl(moment());
	date1 = new FormControl(new Date());
	//date2 = moment(this.date1.value, 'MM/DD/YYYY').add(30, 'day').toDate();
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
		private ownService : OwnershipContractService,
		private leaseService : LeaseContractService,
		private layoutConfigService: LayoutConfigService,
		private powerMasterService : PowerMeterService,
		private waterMasterService : WaterMeterService,
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
			} else {
				this.billing = new BillingModel();
				this.billing.clear();
				this.initBilling();
			}
		});
		this.subscriptions.push(routeSubscription);
	}
	initBilling() {
		this.createForm();
		this.loadUnit();
		
		
	}
	createForm() {
			this.billingForm = this.billingFB.group({
				contract: ["", Validators.required],
				unit2 : [""],
				billed_to: ["", Validators.required],

				billing: this.billingFB.group({
					service_charge: 
					this.billingFB.group({
						amount: [""]
					}),
					sinkingfund: this.billingFB.group({
						amountsink: [""]
					}),
					ipl: this.billingFB.group({
						amountipl : [""]
					}),
					electricity: this.billingFB.group({
						electric_trans: [""],
						electric_amount: [""],
					}),
					water: this.billingFB.group({
						water_trans: [""],
						water_amount: [""],
					}),
				}),
				unit : [""],
				totalBilling : [""],

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
				
				billing_number: [ {value:this.codenum, disabled: true}, Validators.required],
				created_date: [{value: this.date1.value, disabled: true}, Validators.required],
				billing_date: [{value: this.date1.value, disabled: false}, Validators.required],
				due_date: ["", Validators.required],
				
			});
			this.getBillingNumber();
	}

	getBillingNumber(){
		this.serviceBill.getBillingNumber().subscribe(
			res => {
				this.codenum = res.data
				const controls = this.billingForm.controls;
				controls.billing_number.setValue(this.codenum);
				controls.due_date.setValue(moment(this.date1.value, 'MM/DD/YYYY').add(15, 'day').toDate());

			}
		);
	}

	

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.billingForm.controls;
		/** check form */
		if (this.billingForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedBilling = this.prepareBilling();
		this.addBilling(editedBilling, withBack);
	}
	
	
	addBilling( _billing: BillingModel, withBack: boolean = false) {
		const addSubscription = this.serviceBill.createBilling(_billing).subscribe(
			res => {
				const message = `New billing successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/billing`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding billing | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	getComponentTitle() {
		let result = 'Create IPL Billing';
		return result;
	}
	
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	reset() {
		this.billing = Object.assign({}, this.oldBilling);
		this.createForm();
		this.hasFormErrors = false;
		this.billingForm.markAsPristine();
		this.billingForm.markAsUntouched();
		this.billingForm.updateValueAndValidity();
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

	

	transaksiPower(){
		const controls = this.billingForm.controls;
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
			controls.billing.get('electricity')['controls'].electric_amount.setValue(this.hasiltotal);
			this.getAlldata();
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
		const controls = this.billingForm.controls;
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
			controls.billing.get('water')['controls'].water_amount.setValue(allwateramount);
			this.getAlldata();
		}
	}

	

	loadUnit(){
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
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

	unitOnChange(id){
		const controls = this.billingForm.controls;
		this.serviceUnit.getUnitById(id).subscribe(
			data => {
				this.type = data.data.type;
				console.log(id);
				this.loadPower(id);
				this.loadWater(id);
				this.loadMasterWater(data.data.wtrmtr._id);
				this.loadMasterPower(data.data.pwrmtr._id);

				if (this.type == "owner" || this.type == "pp"){
					this.ownService.findOwnershipContractByUnit(id).subscribe(
						dataowner => {
							this.billingForm.controls.contract.setValue(dataowner.data[0]._id);
							this.billingForm.controls.billed_to.setValue(dataowner.data[0].contact_name);
							this.billingForm.controls.unit2.setValue(dataowner.data[0].unit2);
							this.billstats = dataowner.data[0].billstatus;
							const contractDate = dataowner.data[0].contract_date;
							const contractDatatoDate = new Date(contractDate).getMonth();
							console.log(this.billstats);
							if (this.billstats < 1){
								if (contractDatatoDate == 0 || contractDatatoDate == 3 || contractDatatoDate == 6 || contractDatatoDate == 9) 
								{
								  const xdata = 3
								  
								  controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * xdata);
								  controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * xdata);
								  controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * xdata) + (data.data.untrt.sinking_fund * xdata))	
								}else if (contractDatatoDate == 1 || contractDatatoDate == 4 || contractDatatoDate == 7 || contractDatatoDate == 10)
								{
								  const xdata2 = 2
								  controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * xdata2);
								  controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * xdata2);
								  controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * xdata2) + (data.data.untrt.sinking_fund * xdata2))
								}else{
								  const xdata3 = 1
								  controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * xdata3);
								  controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * xdata3);
								  controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * xdata3) + (data.data.untrt.sinking_fund * xdata3))
								}
							}else{
								if (this.date1.value.getMonth() == 0 || this.date1.value.getMonth() == 3 || this.date1.value.getMonth() == 6 || this.date1.value.getMonth() == 9) 
								{
								  const dat4 = 3
								  controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * dat4);
								  controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * dat4);
								  controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * dat4) + (data.data.untrt.sinking_fund * dat4))
								}
								else {
								   const dat5 = 0;
								   controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * dat5);
								   controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * dat5);
								   controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * dat5) + (data.data.untrt.sinking_fund * dat5))
								}
							}
						}
					)
				}else{
						this.leaseService.findLeaseContractByUnit(id).subscribe(
							datalease => {
								this.billingForm.controls.contract.setValue(datalease.data[0]._id);
								this.billingForm.controls.billed_to.setValue(datalease.data[0].contact_name);
								this.billingForm.controls.unit2.setValue(datalease.data[0].unit2);
								console.log(datalease.data[0].billstatus);
								const contractDate = datalease.data[0].contract_date;
							const contractDatatoDate = new Date(contractDate).getMonth();
							console.log(this.billstats);
							if (this.billstats < 1){
								if (contractDatatoDate == 0 || contractDatatoDate == 3 || contractDatatoDate == 6 || contractDatatoDate == 9) 
								{
								  const xdata = 3
								  controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * xdata);
								  controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * xdata);
								  controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * xdata) + (data.data.untrt.sinking_fund * xdata))	
								}else if (contractDatatoDate == 1 || contractDatatoDate == 4 || contractDatatoDate == 7 || contractDatatoDate == 10)
								{
								  const xdata2 = 2
								  controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * xdata2);
								  controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * xdata2);
								  controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * xdata2) + (data.data.untrt.sinking_fund * xdata2))
								}else{
								  const xdata3 = 1
								  controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * xdata3);
								  controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * xdata3);
								  controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * xdata3) + (data.data.untrt.sinking_fund * xdata3))
								}
							}else{
									if (this.date1.value.getMonth() == 0 || this.date1.value.getMonth() == 3 || this.date1.value.getMonth() == 6 || this.date1.value.getMonth() == 9) 
									{
									const dat4 = 3
									controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * dat4);
									controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * dat4);
									controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * dat4) + (data.data.untrt.sinking_fund * dat4))
									}
									else {
									const dat5 = 0;
									controls.billing.get('service_charge')['controls'].amount.setValue(data.data.untrt.service_rate  * dat5);
									controls.billing.get('sinkingfund')['controls'].amountsink.setValue(data.data.untrt.sinking_fund * dat5);
									controls.billing.get('ipl')['controls'].amountipl.setValue((data.data.untrt.service_rate  * dat5) + (data.data.untrt.sinking_fund * dat5))
										}
									}
							}
						)
				}
				this.getAlldata();
			}
		)
	}
	
	loadMasterPower(id){
		const controls = this.billingForm.controls;
		this.powerMasterService.getPowerMeter(id).subscribe(
			res => {
				controls.ppju.setValue(res.data.rte.ppju);
				controls.servicecharge.setValue(res.data.rte.srvc);
			})
	}
	

	getAlldata(){
		const controls = this.billingForm.controls;
		const dataIPL = controls.billing.get('ipl')['controls'].amountipl.value;
		const dataElectricity =controls.billing.get('electricity')['controls'].electric_amount.value; 
		const dataWater =controls.billing.get('water')['controls'].water_amount.value; 
		const dataamount  = dataIPL + dataElectricity + dataWater;
		
		if (dataIPL !== null || dataElectricity !== null || dataWater !== null){
			controls.totalBilling.setValue(dataamount);
			console.log(this.billing.totalBilling);
		}
		
	}

	
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
		const controls = this.billingForm.controls;
		controls.due_date.setValue(moment(event.value, 'MM/DD/YYYY').add(15, 'day').toDate());
	}
	

	prepareBilling(): BillingModel {
		const controls = this.billingForm.controls;
		const _billing = new BillingModel();
		_billing.clear();
		_billing._id = this.billing._id;
		_billing.billed_to = controls.billed_to.value.toLowerCase();
		_billing.contract = controls.contract.value;
		_billing.unit = controls.unit.value;
		_billing.billing_number = controls.billing_number.value;
		_billing.created_date = controls.created_date.value;
		_billing.billing_date = controls.billing_date.value;
		_billing.unit2 = controls.unit2.value.toLowerCase();
		_billing.totalBilling = controls.totalBilling.value;
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
				electric_trans: controls.billing.get('electricity')['controls'].electric_trans.value,
				electric_amount: controls.billing.get('electricity')['controls'].electric_amount.value
			},
			water: {
				water_trans: controls.billing.get('water')['controls'].water_trans.value,
				water_amount: controls.billing.get('water')['controls'].water_amount.value
			},
		};
		return _billing;
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
}
