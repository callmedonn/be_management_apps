import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {OpeningBalanceModel} from "../../../../../core/masterData/openingBalance/openingBalance.model";
import {
	selectLastCreatedOpeningBalanceId,
	selectOpeningBalanceActionLoading,
	selectOpeningBalanceById
} from "../../../../../core/masterData/openingBalance/openingBalance.selector";
import {OpeningBalanceService} from '../../../../../core/masterData/openingBalance/openingBalance.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AccountTypeService } from '../../../../../core/accountType/accountType.service';
import { QueryAccountGroupModel } from '../../../../../core/accountGroup/queryag.model';

@Component({
  selector: 'kt-view-openingBalance',
  templateUrl: './view-openingBalance.component.html',
  styleUrls: ['./view-openingBalance.component.scss']
})
export class ViewOpeningBalanceComponent implements OnInit, OnDestroy {
	// Public properties
	datauser = localStorage.getItem("user");
	openingBalance: OpeningBalanceModel;
	OpeningBalanceId$: Observable<string>;
	oldOpeningBalance: OpeningBalanceModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	openingBalanceForm: FormGroup;
	hasFormErrors = false;
	loadingData = false
	typeResult: any[] = [];
	date1 = new FormControl(new Date());
	selection = new SelectionModel<OpeningBalanceModel>(true, []);
	// loading : boolean = false;
	// Private properties
	private loading = {
		accType: false,
		acc: false,
		submited: false
	}
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private openingBalanceFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: OpeningBalanceService,
		private serviceAccount: AccountTypeService,
		private layoutConfigService: LayoutConfigService,
		private cdr: ChangeDetectorRef
	) { }

	

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectOpeningBalanceActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectOpeningBalanceById(id))).subscribe(res => {
					if (res) {
						this.openingBalance = res;
						this.oldOpeningBalance = Object.assign({}, this.openingBalance);
						this.initOpeningBalance();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initOpeningBalance() {
		this.createForm();
		this.loadAccount();
		this.loadParent();
	}

	createForm() {
		this.openingBalanceForm = this.openingBalanceFB.group({
			typeAccount : [{value:this.openingBalance.typeAccount._id, disabled:true}],
			opening_balance : [this.openingBalance.opening_balance],
			remark : [this.openingBalance.remark],
			createdBy: [this.datauser],
			createdDate: [this.date1.value],
		});
	}

	loadAccount() {
		this.setLoading('accType', true);
		this.selection.clear();

		this.serviceAccount.getListAccountTypeNoParam().subscribe(
			res => {
				this.typeResult = res.data;
				this.setLoading('accType', false);
				this.cdr.markForCheck();
			}
		);
	}

	loadParent() {
		this.selection.clear();
		const queryParams = new QueryAccountGroupModel(
			null,
			1,
			10
		);
	}

	setLoading(type, val) {
		this.loading = {
			...this.loading,
			[type]: val
		}
	}

	goBackWithId() {
		const url = `/openingBalance`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshOpeningBalance(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/openingBalance/view/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = 'View Opening Balance';		
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	inputKeydownHandler(event) {
		return event.keyCode === 8 || event.keyCode === 46 ? true : !isNaN(Number(event.key)) || event.key === '.';
	}
}
