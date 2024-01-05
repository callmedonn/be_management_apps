import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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

@Component({
  selector: 'kt-add-ownership',
  templateUrl: './add-ownership.component.html',
  styleUrls: ['./add-ownership.component.scss']
})
export class AddOwnershipComponent implements OnInit {

	dataSource: OwnershipContractDataSource;
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
	date1 = new FormControl(new Date());
	isPkp: boolean = false;
	loading : boolean = false;
	// Private Properties
	private subscriptions: Subscription[] = [];

	// Autocomplete Filter and Options
	CstmrResultFiltered = [];
	viewBlockResult = new FormControl();

	private loadingData = {
		block: false,
		floor : false,
		unit : false,	
	}
	

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
				private cd: ChangeDetectorRef,
				private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectCustomerActionLoading));
		this.uloading$ = this.store.pipe(select(selectUnitActionLoading));
		const routeSubscription = this.activatedRoute.params.subscribe(params => {
			this.ownership = new OwnershipContractModel();
			this.ownership.clear();
			this.initOwnership()
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
	}
	showHidden(){
		this.isHidden = true;
	}
	createForm() {
		this.ownersForm = this.ownershipFB.group({
			cstmr : ["", Validators.required],
			contract_number : [{value:"", disabled:true}],
			contract_date: [""],
			contract_number2 : ["", Validators.required],
			expiry_date: [""],
			contact_name: ["", Validators.required],
			contact_address: [{value:"",disabled:true}, Validators.required],
			contact_phone: ["", Validators.required],
			contact_email: [{value:"",disabled:true}, Validators.required],
			contact_city: [{value:"",disabled:true}],
			contact_zip: [{value:"",disabled:true}],
			unit: ["", Validators.required],
			paymentType: ["", Validators.required],
			paymentTerm: ["", Validators.required],
			start_electricity_stand: ["", Validators.required],
			start_water_stand: ["", Validators.required],
			virtualAccount: [""],
			isPKP: ["", Validators.required],
			isPP : [],
			regency : [""],
			tax_id: [""],
			blockId:[""],
			unit2:[""],
			floorId:[""],
			norek: [""],
			ktp : ["", Validators.required],
			npwp : ["", Validators.required],
			createdDate: [this.date1.value],
			billstatus : [0],
			receipt : this.ownershipFB.group({
				bastu  : this.ownershipFB.group({
					bastu1 : false,
				}),
				ppp   : this.ownershipFB.group({
					ppp1 : false,
				}),
				ba  : this.ownershipFB.group({
					ba1 : false,
				}),
				bpb  : this.ownershipFB.group({
					bpb1 : false,
				}),
				kp   : this.ownershipFB.group({
					kp1 : false,
				}),
				kbm   : this.ownershipFB.group({
					kbm1 : false,
				}),
				km   : this.ownershipFB.group({
					km1 : false,
				}),
				ac  : this.ownershipFB.group({
					ac1 : false,
				}),
				ap   : this.ownershipFB.group({
					ap1 : false,
				}),
				sm    : this.ownershipFB.group({
					sm1 : false,
				}),
				sv     : this.ownershipFB.group({
					sv1 : false,
				}),
				bph     : this.ownershipFB.group({
					bph1 : false,
				}),
				ksdm     : this.ownershipFB.group({
					ksdm1 : false,
				}),
			})
		});
	}
	loadBlockList() {
		this.loadingData.block = true
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
				this.loadingData.block = false
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
		this.uservice.findUnitforContract(flrid).subscribe(
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

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.ownersForm.controls;
		/** check form */
		if (this.ownersForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		this.loading  = true;
		const preparedOwnership = this.prepareOwnership();
		this.addOwnership(preparedOwnership, withBack);
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

	prepareOwnership(): OwnershipContractModel{
		const controls = this.ownersForm.controls;
		const _ownership = new OwnershipContractModel();
		_ownership.clear();
		_ownership.cstmr = controls.cstmr.value;
		_ownership.contact_address = controls.contact_address.value.toLowerCase();
		_ownership.contract_number2 = controls.contract_number2.value;
		_ownership.contact_phone = controls.contact_phone.value;
		_ownership.contact_email = controls.contact_email.value;
		_ownership.unit2 = controls.unit2.value.toLowerCase();
		_ownership.contact_city = controls.contact_city.value.toLowerCase();
		_ownership.contact_zip = controls.contact_zip.value;
		_ownership.contract_number = controls.contract_number.value;
		_ownership.unit = controls.unit.value.toLowerCase();
		_ownership.contract_date = controls.contract_date.value;
		_ownership.expiry_date = controls.expiry_date.value;
		_ownership.contact_name = controls.contact_name.value.toLowerCase();
		_ownership.paymentType = controls.paymentType.value.toLowerCase();
		_ownership.paymentTerm = controls.paymentTerm.value;
		_ownership.start_electricity_stand = controls.start_electricity_stand.value;
		_ownership.start_water_stand = controls.start_water_stand.value;
		_ownership.virtualAccount = controls.virtualAccount.value;
		_ownership.isPKP = controls.isPKP.value;
		_ownership.tax_id = controls.npwp.value;
		_ownership.regency = controls.regency.value;
		_ownership.ktp = controls.ktp.value;
		_ownership.npwp = controls.npwp.value;
		_ownership.norek = controls.norek.value;
		_ownership.billstatus = controls.billstatus.value;
		_ownership.createdDate = controls.createdDate.value;
		
		_ownership.isPP = controls.isPP.value;
		_ownership.receipt = { 
			bastu : controls.receipt.get('bastu')['controls'].bastu1.value,
			ppp : controls.receipt.get('ppp')['controls'].ppp1.value,
			ba : controls.receipt.get('ba')['controls'].ba1.value,
			bpb : controls.receipt.get('bpb')['controls'].bpb1.value,
			kp : controls.receipt.get('kp')['controls'].kp1.value,
			kbm : controls.receipt.get('kbm')['controls'].kbm1.value,
			km : controls.receipt.get('km')['controls'].km1.value,
			ac : controls.receipt.get('ac')['controls'].ac1.value,
			ap : controls.receipt.get('ap')['controls'].ap1.value,
			sm : controls.receipt.get('sm')['controls'].sm1.value,
			sv : controls.receipt.get('sv')['controls'].sv1.value,
			bph : controls.receipt.get('bph')['controls'].bph1.value,
			ksdm : controls.receipt.get('ksdm')['controls'].ksdm1.value,
		};
		return _ownership;
	}

	addOwnership(_ownership: OwnershipContractModel, withBack: boolean = false) {
		const addSubscription = this.service.createOwnershipContract(_ownership).subscribe(
			res => {
				const message = `New ownership successfully has been added.`;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				const url = `/contract-management/contract/ownership`;
				this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
			},
			err => {
				console.error(err);
				const message = 'Error while adding ownership | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
			}
		);
		this.subscriptions.push(addSubscription);
	}

	/**
	 * @param value
	 */
		 _setBlockValue(value) {
			console.log(value, 'from the option click');
			this.ownersForm.patchValue({ cstmr: value._id });
			this.getSingleCustomer(value._id);
		}

		_onKeyup(e: any) {
			this.ownersForm.patchValue({ cstmr: undefined });
			this._filterCstmrList(e.target.value);
		}
		
		_filterCstmrList(text: string) {
			this.CstmrResultFiltered = this.customerResult.filter(i => {
				const filterText = `${i.cstrmrnm.toLocaleLowerCase()}`;
		
				if(filterText.includes(text.toLocaleLowerCase())) return i;
			});
		}

		loadCustomerList() {
			this.selection.clear();
			const queryParams = new QueryParamsModel(
				null,
				"asc",
				null,
				1,
				100000
			);
			this.cservice.getListCustomer(queryParams).subscribe(
				res => {
					this.customerResult = res.data;
					this.CstmrResultFiltered = this.customerResult.slice();
					this.cd.markForCheck();
					this.viewBlockResult.enable();
				}
			);
		}

	getSingleCustomer(id){
		const controls = this.ownersForm.controls;
		this.datareset();
		this.cservice.getCustomerById(id).subscribe(data => {
			controls.contact_name.setValue(data.data.cstrmrnm);
			controls.contact_address.setValue(data.data.addrcstmr);
			controls.contact_phone.setValue(data.data.phncstmr);
			controls.contact_email.setValue(data.data.emailcstmr);
			controls.contact_city.setValue(data.data.idvllg.district.regency.name);
			controls.tax_id.setValue(data.data.npwp);
			this.loadPostalcode(data.data.idvllg.district.name)
			controls.contact_zip.setValue(data.data.postcode)
			controls.regency.setValue(data.data.idvllg.district.name)
			controls.ktp.setValue(data.data.cstrmrpid)
			controls.npwp.setValue(data.data.npwp)
		});
	}

	datareset(){
		const controls = this.ownersForm.controls;
		controls.contact_name.setValue("");
		controls.contact_address.setValue("");
		controls.contact_phone.setValue("");
		controls.contact_email.setValue("");
		controls.contact_city.setValue("");
		controls.tax_id.setValue("");
		this.loadPostalcode("")
		controls.contact_zip.setValue("")
		controls.regency.setValue("")
		controls.ktp.setValue("")
		controls.npwp.setValue("")
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
		let result = 'Create Ownership Contract';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

}
