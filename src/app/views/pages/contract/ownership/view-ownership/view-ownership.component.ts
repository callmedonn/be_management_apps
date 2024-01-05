import { Component, OnInit, OnDestroy } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OwnershipContractModel} from '../../../../../core/contract/ownership/ownership.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../../core/reducers';

import {SelectionModel} from '@angular/cdk/collections';
import {OwnershipContractDataSource} from '../../../../../core/contract/ownership/ownership.datasource';
import {CustomerService} from '../../../../../core/customer/customer.service';
import {UnitService} from '../../../../../core/unit/unit.service';
import {selectCustomerActionLoading} from '../../../../../core/customer/customer.selector';
import {selectUnitActionLoading} from '../../../../../core/unit/unit.selector';
import {QueryUnitModel} from '../../../../../core/unit/queryunit.model';
import {OwnershipContractService} from '../../../../../core/contract/ownership/ownership.service';
import { BlockService } from '../../../../../core/block/block.service';
import { QueryBlockModel } from '../../../../../core/block/queryblock.model';
import { QueryFloorModel } from '../../../../../core/floor/queryfloor.model';
import { FloorService } from '../../../../../core/floor/floor.service';
import { StateService } from '../../../../../core/state/state.service';
import { selectOwnershipContractActionLoading, selectOwnershipContractById } from '../../../../../core/contract/ownership/ownership.selector';
import { OwnershipContractUpdated } from '../../../../../core/contract/ownership/ownership.action';
import { Update } from '@ngrx/entity';

@Component({
  selector: 'kt-view-ownership',
  templateUrl: './view-ownership.component.html',
  styleUrls: ['./view-ownership.component.scss']
})
export class ViewOwnershipComponent implements OnInit {

	dataSource: OwnershipContractDataSource;
	//customer: CustomerModel;
	ownership: OwnershipContractModel;
	ownershipId$: Observable<string>;
	oldOwnership: OwnershipContractModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	uloading$: Observable<boolean>;
	ownersForm: FormGroup;
	hasFormErrors = false;
	selection = new SelectionModel<OwnershipContractModel>(true, []);
	customerResult: any[] = [];
	unitResult: any[] = [];
	blockResult: any[] = [];
	floorResult: any[]=[];
	postalcodeResult: any[] = [];
	isHidden: boolean = true;
	TaxId: boolean = true;
	isPkp: boolean = false;
	loading : boolean = false;
	taxvalue: string;
	// Private Properties
	private subscriptions: Subscription[] = [];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private ownershipFB: FormBuilder,
				private subheaderService: SubheaderService,
				private service: OwnershipContractService,
				private cservice: CustomerService,
				private uservice: UnitService,
				private serviceBlk: BlockService,
				private serviceFloor: FloorService,
				private stateService: StateService,
				private layoutUtilsService: LayoutUtilsService,
				private store: Store<AppState>,
				private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectOwnershipContractActionLoading));
		this.uloading$ = this.store.pipe(select(selectUnitActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id){
				this.store.pipe(select(selectOwnershipContractById(id))).subscribe(res => {
					if (res) {
						this.isPkp = res.isPKP;
						if (this.isPkp == true){
							this.TaxId = false;
							this.taxvalue = res.tax_id;

						} else {
							this.TaxId = true;
						}
						
						this.ownership = res;
						this.oldOwnership = Object.assign({}, this.ownership);
						this.initOwnership();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	initOwnership(){
		this.createForm();
		this.loadCustomerList();
		this.loadBlockList();
		this.loadPostalcode(this.ownership.regency);
		this.loadFloorList(this.ownership.unit.flr.blk._id);
		this.loadUnitList(this.ownership.unit.flr._id);

	}

	showHidden(){
		this.isHidden = true;
	}


	createForm() {
		this.ownersForm = this.ownershipFB.group({
			cstmr : [{value:this.ownership.cstmr._id, disabled:true}],
			contact_name: [{value:this.ownership.contact_name, disabled:true}],
			contact_address: [{value:this.ownership.contact_address, disabled:true}],
			contact_phone: [{value:this.ownership.contact_phone, disabled:true}],
			contact_email: [{value:this.ownership.contact_email, disabled:true}],
			contact_city: [{value:this.ownership.contact_city,  disabled:true}],
			contact_zip: [{value:this.ownership.contact_zip, disabled:true}],
			ktp : [{value:this.ownership.ktp, disabled:true}],
			npwp : [{value:this.ownership.npwp, disabled:true}],
			contract_number : [{value:this.ownership.contract_number, disabled:true}],
			contract_number2 : [{value:this.ownership.contract_number2, disabled:true}],
			contract_date: [{value:this.ownership.contract_date, disabled:true}],
			expiry_date: [{value:this.ownership.expiry_date, disabled:true}],
			unit: [{value:this.ownership.unit._id, disabled:true}],
			start_electricity_stand: [{value:this.ownership.start_electricity_stand, disabled:true}],
			start_water_stand: [{value:this.ownership.start_water_stand, disabled:true}],
			isPP : [{value:this.ownership.isPP, disabled:true}],
			blockId:[{value:this.ownership.unit.flr.blk._id, disabled:true}],
			floorId:[{value:this.ownership.unit.flr._id, disabled:true}],
            unit2:[this.ownership.unit2],
			paymentType: [{value:this.ownership.paymentType, disabled:true}],
			paymentTerm: [{value:this.ownership.paymentTerm, disabled:true}],
			virtualAccount: [{value:this.ownership.virtualAccount, disabled:true}],
			isPKP: [{value:this.ownership.isPKP, disabled:true}],
			tax_id: [{value:this.ownership.tax_id, disabled:true}],
			regency : [{value:this.ownership.regency}],
			norek: [{value:this.ownership.norek, disabled:true}],
			receipt : this.ownershipFB.group({
				bastu  : this.ownershipFB.group({
					bastu1 : [{value:this.ownership.receipt.bastu, disabled:true}],
				}),
				ppp   : this.ownershipFB.group({
					ppp1 : [{value:this.ownership.receipt.ppp, disabled:true}],
				}),
				ba  : this.ownershipFB.group({
					ba1 : [{value:this.ownership.receipt.ba, disabled:true}],
				}),
				bpb  : this.ownershipFB.group({
					bpb1 : [{value:this.ownership.receipt.bpb, disabled:true}],
				}),
				kp   : this.ownershipFB.group({
					kp1 : [{value:this.ownership.receipt.kp, disabled:true}],
				}),
				kbm   : this.ownershipFB.group({
					kbm1 : [{value:this.ownership.receipt.kbm, disabled:true}],
				}),
				km   : this.ownershipFB.group({
					km1 : [{value:this.ownership.receipt.km, disabled:true}],
				}),
				ac  : this.ownershipFB.group({
					ac1 : [{value:this.ownership.receipt.ac, disabled:true}],
				}),
				ap   : this.ownershipFB.group({
					ap1 : [{value:this.ownership.receipt.ap, disabled:true}],
				}),
				sm    : this.ownershipFB.group({
					sm1 : [{value:this.ownership.receipt.sm, disabled:true}],
				}),
				sv     : this.ownershipFB.group({
					sv1 : [{value:this.ownership.receipt.sv, disabled:true}],
				}),
				bph     : this.ownershipFB.group({
					bph1 : [{value:this.ownership.receipt.bph, disabled:true}],
				}),
				ksdm     : this.ownershipFB.group({
					ksdm1 : [{value:this.ownership.receipt.ksdm, disabled:true}],
				}),
			})
		});
	}

	loadBlockList() {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			null,
			1,
			100
		);
		this.serviceBlk.getListBlock(queryParams).subscribe(
			res => {
				this.blockResult = res.data;
			}
		);
	}
	
	loadFloorList(blkid){
		this.selection.clear();
		const queryParams = new QueryFloorModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.serviceFloor.findFloorByParent(blkid).subscribe(
			res => {
				this.floorResult = res.data;
			}
		);
	}

	loadUnitList(flrid){
		this.selection.clear();
		const queryParams = new QueryUnitModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.uservice.findUnitByParent(flrid).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}
	
	blkChange(item){
		if(item){
			this.loadFloorList(item);
			this.ownersForm.controls.flr.enable();
		}
	}
	flrChange(item){
		if(item){
			this.loadUnitList(item);
			this.ownersForm.controls.unt.enable();
		}
	}

	getSingleCustomer(id){
		const controls = this.ownersForm.controls;
		this.cservice.getCustomerById(id).subscribe(data => {
			controls.ktp.setValue(data.data.cstrmrpid);
			controls.npwp.setValue(data.data.npwp);
			console.log(data.data.npwp)
			controls.contact_name.setValue(data.data.cstrmrnm);
			controls.contact_address.setValue(data.data.addrcstmr);
			controls.contact_phone.setValue(data.data.phncstmr);
			controls.contact_email.setValue(data.data.emailcstmr);
			controls.contact_city.setValue(data.data.idvllg.district.regency.name);
			controls.tax_id.setValue(data.data.npwp);
			this.loadPostalcode(data.data.idvllg.district.name);
			controls.contact_zip.setValue(data.data.postcode);
		});
	}


	
	goBackWithId() {
		const url = `/contract-management/contract/ownership`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshOwnership(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/contract-management/contract/ownership/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	
	loadCustomerList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			10
		);
		this.cservice.getListCustomer(queryParams).subscribe(
			res => {
				this.customerResult = res.data;
			}
		);
	}


	getContactNumber(unitid) {
		this.service.getOwnershipContractNumber(unitid).subscribe(
			res => {
				const controls = this.ownersForm.controls;
				controls.contract_number.setValue(res.data);
			}
		);
		this.uservice.getUnitById(unitid).subscribe(
			res => {
				const controls = this.ownersForm.controls;
				controls.unit2.setValue(res.data.cdunt)
			}
		)
	}

	
	loadPostalcode(regencyName: string){
		const queryParams = new QueryParamsModel(null,
			"asc",
			"grpnm",
			1,
			10);
		this.stateService.getListPostalcode(queryParams, regencyName).subscribe(
			res => {
				this.postalcodeResult = res.data;
				console.log(res.data)
			}
		);
	}

	changePKP(){
		if (this.isPkp == true){
			this.TaxId = false;
			this.showTaxId();
		} else {
			// console.log(this.leaseForm.controls['tax_id']);
			this.TaxId = true;
			this.hiddenTaxId()
		}
	}

	hiddenTaxId(){
		this.ownersForm.controls['tax_id'].setValidators([]);
		this.ownersForm.controls['tax_id'].updateValueAndValidity();
		console.log(this.TaxId);
		console.log(this.ownersForm.get('tax_id'));
	}
	showTaxId(){
		this.ownersForm.controls['tax_id'].setValidators([Validators.required]);
		// this.leaseForm.get('tax_id').setValidators([Validators.required]);
		this.ownersForm.controls['tax_id'].updateValueAndValidity();
		console.log(this.TaxId);
		console.log(this.ownersForm.get('tax_id'));
	}

	getComponentTitle() {
		let result = 'View Ownership Contract';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

}
