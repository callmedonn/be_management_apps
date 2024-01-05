import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip} from 'rxjs/operators';
import { fromEvent, merge,Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';

import { TaxModel } from '../../../../../core/masterData/tax/tax.model';
import { TaxDeleted, TaxPageRequested} from '../../../../../core/masterData/tax/tax.action';
import {TaxDataSource} from '../../../../../core/masterData/tax/tax.datasource';
import {SubheaderService} from '../../../../../core/_base/layout';
import {TaxService} from '../../../../../core/masterData/tax/tax.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryTaxModel } from '../../../../../core/masterData/tax/querytax.model';

@Component({
  selector: 'kt-list-tax',
  templateUrl: './list-tax.component.html',
  styleUrls: ['./list-tax.component.scss']
})
export class ListTaxComponent implements OnInit, OnDestroy {
	file;
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	dataSource: TaxDataSource;
	displayedColumns = [ 'taxName', 'tax', 'remarks','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<TaxModel>(true, []);
	taxResult: TaxModel[] = [];


	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: TaxService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService : NgbModal
	) { }

  	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadTaxList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(50), 
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadTaxList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Tax');

		this.dataSource = new TaxDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.taxResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadTaxList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.taxName = `${searchText}`;
		return filter;
	}

	loadTaxList(){
		this.selection.clear();
		const queryParams = new QueryTaxModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new TaxPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteTax(_item: TaxModel) {
		const _title = 'Tax Delete';
		const _description = 'Are you sure to permanently delete this tax?';
		const _waitDesciption = 'Tax is deleting...';
		const _deleteMessage = `Tax has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new TaxDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			window.location = window.location
		});
	}


	editTax(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewTax(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

}
