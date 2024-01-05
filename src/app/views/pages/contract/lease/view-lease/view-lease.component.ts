import { Component, OnInit, OnDestroy } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LeaseContractModel} from '../../../../../core/contract/lease/lease.model';
import {ActivatedRoute, Router} from '@angular/router';
import {LayoutConfigService, SubheaderService} from '../../../../../core/_base/layout';
import {LayoutUtilsService, MessageType, QueryParamsModel} from '../../../../../core/_base/crud';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../../../core/reducers';
import { selectLeaseContractActionLoading,
	selectLeaseContractById,
	selectLastCreatedLeaseContractId
} from '../../../../../core/contract/lease/lease.selector';
import { LeaseContractOnServerCreated, LeaseContractUpdated } from '../../../../../core/contract/lease/lease.action';
import {Update} from '@ngrx/entity';
import {SelectionModel} from '@angular/cdk/collections';
import { UnitModel } from '../../../../../core/unit/unit.model';
import {CustomerService} from '../../../../../core/customer/customer.service';
import {UnitService} from '../../../../../core/unit/unit.service';
import {selectUnitActionLoading} from '../../../../../core/unit/unit.selector';
import {selectCustomerActionLoading} from '../../../../../core/customer/customer.selector';
import {QueryUnitModel} from '../../../../../core/unit/queryunit.model';
import {LeaseContractService} from '../../../../../core/contract/lease/lease.service';
import { BlockService } from '../../../../../core/block/block.service';
import { QueryBlockModel } from '../../../../../core/block/queryblock.model';
import { QueryBuildingModel } from '../../../../../core/building/querybuilding.model';
import { BuildingService } from '../../../../../core/building/building.service';
import { QueryFloorModel } from '../../../../../core/floor/queryfloor.model';
import { FloorService } from '../../../../../core/floor/floor.service';
import { StateService } from '../../../../../core/state/state.service';

@Component({
  selector: 'kt-view-lease',
  templateUrl: './view-lease.component.html',
})
export class ViewLeaseComponent implements OnInit, OnDestroy {
	lease: LeaseContractModel;
	leaseId$: Observable<string>;
	oldLease: LeaseContractModel;
	uloading$: Observable<boolean>;
	selectedTab = 0;
	loading$: Observable<boolean>;
	leaseForm: FormGroup;
	selection = new SelectionModel<LeaseContractModel>(true, []);
	hasFormErrors = false;
	customerResult: any[] = [];
	unitResult: any[] = [];
	blockResult: any[] = [];
	buildingResult : any[]=[];
	postalcodeResult: any[] = [];
	floorResult: any[]=[];
	TaxId: boolean;
	isPkp: boolean;
	taxvalue: string;
	loading : boolean;

	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private leaseFB: FormBuilder,
				private subheaderService: SubheaderService,
				private layoutUtilsService: LayoutUtilsService,
				private store: Store<AppState>,
				private service: LeaseContractService,
				private cservice: CustomerService,
				private serviceBlk: BlockService,
				private serviceBld: BuildingService,
				private stateService: StateService,
				private serviceFloor: FloorService,
				private uservice: UnitService,
				private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectLeaseContractActionLoading));
		this.uloading$ = this.store.pipe(select(selectUnitActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id){
				this.store.pipe(select(selectLeaseContractById(id))).subscribe(res => {
					if (res) {
						this.isPkp = res.isPKP;
						if (this.isPkp == true){
							this.TaxId = false;
							this.taxvalue = res.tax_id;
						} else {
							this.TaxId = true;
						}
						this.lease = res;
						this.oldLease = Object.assign({}, this.lease);
						this.initLease();
					}
				});
			}
		});

		this.subscriptions.push(routeSubscription);
	}

	initLease() {
		this.createForm();
		this.loadCustomerList();
		this.loadBlockList();
		this.loadPostalcode(this.lease.regency)
		this.loadFloorList(this.lease.unit.flr.blk._id);
		this.loadUnitList(this.lease.unit.flr._id);
	}

	

	createForm() {
		this.leaseForm = this.leaseFB.group({
			cstmr : [{value:this.lease.cstmr._id, disabled:true}, Validators.required],
			contact_name : [{value:this.lease.contact_name, disabled:true}],
			contact_address : [{value:this.lease.contact_address, disabled:true},Validators.required],
			contact_phone : [{value:this.lease.contact_phone, disabled:true}],
			contact_email : [{value:this.lease.contact_email, disabled:true}],
			contact_city : [{value:this.lease.contact_city, disabled:true}],
			contact_zip : [{value:this.lease.contact_zip, disabled:true}],
			ktp : [{value:this.lease.ktp, disabled:true}],
			npwp : [{value:this.lease.npwp, disabled:true}],


			unit : [{value:this.lease.unit._id, disabled:true}],
			blockId:[{value:this.lease.unit.flr.blk._id, disabled:true}],
			floorId:[{value:this.lease.unit.flr._id, disabled:true}],
			contract_number : [{value:this.lease.contract_number, disabled:true}],
			contract_date : [{value:this.lease.contract_date, disabled:true}],
			expiry_date : [{value:this.lease.expiry_date, disabled:true}],
			rentalAmount : [{value:this.lease.rentalAmount, disabled:true}],
			start_electricity_stand : [{value:this.lease.start_electricity_stand, disabled:true}],
			start_water_stand : [{value:this.lease.start_water_stand, disabled:true}],
			typeLease: [{value:this.lease.typeLease, disabled:true}],


			paymentType : [{value:this.lease.paymentType, disabled:true}],
			paymentTerm : [{value:this.lease.paymentTerm, disabled:true}],
			virtualAccount : [{value:this.lease.virtualAccount, disabled:true}],
			norek : [{value:this.lease.norek, disabled:true}],
			isPKP: [{value:this.lease.isPKP, disabled:true}],
			tax_id: [{value:this.lease.tax_id, disabled:true}],

			receipt : this.leaseFB.group({
				bastu  : this.leaseFB.group({
					bastu1 : [{value:this.lease.receipt.bastu, disabled:true}],
				}),
				ppp   : this.leaseFB.group({
					ppp1 : [{value:this.lease.receipt.ppp, disabled:true}],
				}),
				ba  : this.leaseFB.group({
					ba1 : [{value:this.lease.receipt.ba, disabled:true}],
				}),
				bpb  : this.leaseFB.group({
					bpb1 : [{value:this.lease.receipt.bpb, disabled:true}],
				}),
				kp   : this.leaseFB.group({
					kp1 : [{value:this.lease.receipt.kp, disabled:true}],
				}),
				kbm   : this.leaseFB.group({
					kbm1 : [{value:this.lease.receipt.kbm, disabled:true}],
				}),
				km   : this.leaseFB.group({
					km1 : [{value:this.lease.receipt.km, disabled:true}],
				}),
				ac  : this.leaseFB.group({
					ac1 : [{value:this.lease.receipt.ac, disabled:true}],
				}),
				ap   : this.leaseFB.group({
					ap1 : [{value:this.lease.receipt.ap, disabled:true}],
				}),
				sm    : this.leaseFB.group({
					sm1 : [{value:this.lease.receipt.sm, disabled:true}],
				}),
				sv     : this.leaseFB.group({
					sv1 : [{value:this.lease.receipt.sv, disabled:true}],
				}),
				bph     : this.leaseFB.group({
					bph1 : [{value:this.lease.receipt.bph, disabled:true}],
				}),
				ksdm     : this.leaseFB.group({
					ksdm1 : [{value:this.lease.receipt.ksdm, disabled:true}],
				}),
			})
		})
	}

	loadBlockList() {
		this.selection.clear();
		const queryParams = new QueryBlockModel(
			null,
			"asc",
			null,
			1,
			1000
		);
		this.serviceBlk.getListBlock(queryParams).subscribe(
			res => {
				this.blockResult = res.data;
			}
		);
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

	getSingleCustomer(id){
		const controls = this.leaseForm.controls;
		this.cservice.getCustomerById(id).subscribe(data => {
			this.loadPostalcode(data.data.idvllg.district.name);
			controls.contact_zip.setValue(data.data.postcode);
			controls.contact_name.setValue(data.data.cstrmrnm);
			controls.contact_address.setValue(data.data.addrcstmr);
			controls.contact_phone.setValue(data.data.phncstmr);
			controls.contact_email.setValue(data.data.emailcstmr);
			controls.ktp.setValue(data.data.cstrmrpid);
			controls.npwp.setValue(data.data.npwp);
			controls.contact_city.setValue(data.data.idvllg.district.regency.name);
			controls.tax_id.setValue(data.data.npwp);
			controls.regency.setValue(data.data.idvllg.district.name);
			
		});
	}

	loadPostalcode(regencyName: string){
		const queryParams = new QueryParamsModel(
			null,
			"asc",
			null,
			1,
			10);
		this.stateService.getListPostalcode(queryParams, regencyName).subscribe(
			res => {
				this.postalcodeResult = res.data;
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
			1000
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
			1000
		);
		this.uservice.findUnitByParent(flrid).subscribe(
			res => {
				this.unitResult = res.data;
			}
		);
	}
	
	goBackWithId() {
		const url = `/contract-management/contract/lease`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	blkChange(item){
		if(item){
			this.loadFloorList(item);
			this.leaseForm.controls.flr.enable();
		}
	}
	flrChange(item){
		if(item){
			this.loadUnitList(item);
			this.leaseForm.controls.unt.enable();
		}
	}

	refreshLease(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/contract-management/contract/lease/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	
	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
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
		this.leaseForm.controls['tax_id'].setValidators([]);
		this.leaseForm.controls['tax_id'].updateValueAndValidity();
		console.log(this.TaxId);
		console.log(this.leaseForm.get('tax_id'));
	}
	showTaxId(){
		this.leaseForm.controls['tax_id'].setValidators([Validators.required]);
		// this.leaseForm.get('tax_id').setValidators([Validators.required]);
		this.leaseForm.controls['tax_id'].updateValueAndValidity();
		console.log(this.TaxId);
		console.log(this.leaseForm.get('tax_id'));
	}

	getComponentTitle() {
		let result = 'View Tenant Contract';

		return result;
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
