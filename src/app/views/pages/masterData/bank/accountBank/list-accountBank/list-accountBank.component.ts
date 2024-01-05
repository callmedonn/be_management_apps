// Angular
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Material
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
// RXJS
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
// LODASH
import { each, find } from 'lodash';
// NGRX
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../../core/reducers';

//services
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../../core/_base/crud';

import { AccountBankModel } from '../../../../../../core/masterData/bank/accountBank/accountBank.model';
import { AccountBankDeleted, AccountBankPageRequested} from '../../../../../../core/masterData/bank/accountBank/accountBank.action';
import {AccountBankDataSource} from '../../../../../../core/masterData/bank/accountBank/accountBank.datasource';
import {SubheaderService} from '../../../../../../core/_base/layout';
import {AccountBankService} from '../../../../../../core/masterData/bank/accountBank/accountBank.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryAccountBankModel } from '../../../../../../core/masterData/bank/accountBank/queryaccountBank.model';

@Component({
  selector: 'kt-list-accountBank',
  templateUrl: './list-accountBank.component.html',
  styleUrls: ['./list-accountBank.component.scss']
})
export class ListAccountBankComponent implements OnInit, OnDestroy {
	file;
	dataSource: AccountBankDataSource;
	displayedColumns = [ 'acctName','bank','branch','acctNum','remarks','actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	// Selection
	selection = new SelectionModel<AccountBankModel>(true, []);
	accountBankResult: AccountBankModel[] = [];
	// Subscriptions
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: AccountBankService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService : NgbModal
	) { }

  	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadAccountBankList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(50), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadAccountBankList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Bank Account');

		// Init DataSource
		this.dataSource = new AccountBankDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.accountBankResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		
		this.loadAccountBankList();
  	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.acctName = `${searchText}`;
		return filter;
	}

	loadAccountBankList(){
		this.selection.clear();
		const queryParams = new QueryAccountBankModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new AccountBankPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	deleteAccountBank(_item: AccountBankModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Account Bank Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this account bank?';
		const _waitDesciption = 'Account bank is deleting...';
		const _deleteMessage = `Account bank has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new AccountBankDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			window.location = window.location
		});
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.accountBankResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.accountBankResult.length) {
			this.selection.clear();
		} else {
			this.accountBankResult.forEach(row => this.selection.select(row));
		}
	}

	editAccountBank(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewAccountBank(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}
	
  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}


	
}
