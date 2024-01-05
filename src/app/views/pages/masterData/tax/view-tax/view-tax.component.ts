import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
import {TaxModel} from "../../../../../core/masterData/tax/tax.model";
import {
	selectLastCreatedTaxId,
	selectTaxActionLoading,
	selectTaxById
} from "../../../../../core/masterData/tax/tax.selector";
import {TaxService} from '../../../../../core/masterData/tax/tax.service';

@Component({
  selector: 'kt-view-tax',
  templateUrl: './view-tax.component.html',
  styleUrls: ['./view-tax.component.scss']
})
export class ViewTaxComponent implements OnInit, OnDestroy {
	// Public properties
	tax: TaxModel;
	TaxId$: Observable<string>;
	oldTax: TaxModel;
	selectedTab = 0;
	loading$: Observable<boolean>;
	taxForm: FormGroup;
	hasFormErrors = false;
	loading : boolean = false;
	// Private properties
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private taxFB: FormBuilder,
		private subheaderService: SubheaderService,
		private layoutUtilsService: LayoutUtilsService,
		private store: Store<AppState>,
		private service: TaxService,
		private layoutConfigService: LayoutConfigService
	) { }

  	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectTaxActionLoading));
		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id) {
				this.store.pipe(select(selectTaxById(id))).subscribe(res => {
					if (res) {
						this.tax = res;
						this.oldTax = Object.assign({}, this.tax);
						this.initTax();
					}
				});
			}
		});
		this.subscriptions.push(routeSubscription);
  	}

	initTax() {
		this.createForm();
	}

	createForm() {
		this.taxForm = this.taxFB.group({
			taxName: [{value:this.tax.taxName, disabled:true}],
			tax: [{value:this.tax.tax, disabled:true}],
			remarks: [{value:this.tax.remarks, disabled:true}],
		});
	}

	goBackWithId() {
		const url = `/tax`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	refreshTax(isNew: boolean = false, id:string = "") {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/tax/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	getComponentTitle() {
		let result = `View Tax`;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
}
