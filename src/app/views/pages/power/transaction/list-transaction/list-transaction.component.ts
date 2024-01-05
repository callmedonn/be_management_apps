import {Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip,} from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store} from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType} from '../../../../../core/_base/crud';
import {PowerTransactionDataSource} from "../../../../../core/power/transaction/transaction.datasource";
import {PowerTransactionModel} from "../../../../../core/power/transaction/transaction.model";
import {SubheaderService} from "../../../../../core/_base/layout";
import {PowerTransactionService} from "../../../../../core/power/transaction/transaction.service";
import {PowerTransactionDeleted, PowerTransactionPageRequested} from "../../../../../core/power/transaction/transaction.action";
import { QueryPowerTransactionModel } from '../../../../../core/power/transaction/querytransaction.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';


@Component({
  selector: 'kt-list-transaction',
  templateUrl: './list-transaction.component.html',
  styleUrls: ['./list-transaction.component.scss']
})
export class ListTransactionComponent implements OnInit, OnDestroy {
	file;
	dataSource: PowerTransactionDataSource;
	displayedColumns = ['powname', 'unit', 'strtpos', 'endpos', 'billmnt', 'status', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryPowerTransactionModel;
	selection = new SelectionModel<PowerTransactionModel>(true, []);
	powerTransactionResult: PowerTransactionModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: PowerTransactionService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http: HttpClient,
		private modalService: NgbModal,
	) { }
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadPowerTransactionList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150),
			distinctUntilChanged(),
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadPowerTransactionList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Electricity Consumption');

		this.dataSource = new PowerTransactionDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.powerTransactionResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadPowerTransactionList();
	}
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.powname = `${searchText}`;
		return filter;
	}
	loadPowerTransactionList() {
		this.selection.clear();
		const queryParams = new QueryPowerTransactionModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new PowerTransactionPageRequested({ page: queryParams }));
		this.selection.clear();
	}
	deletePowerTransaction(_item: PowerTransactionModel) {
		const _title = 'Electricity Consumption Delete';
		const _description = 'Are you sure to permanently delete this electricity consumption?';
		const _waitDesciption = 'electricity consumption is deleting...';
		const _deleteMessage = `electricity consumption has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new PowerTransactionDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}
	fetchPowerTransaction() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.pow.nmmtr} , Rate: Rp. ${elem.pow.rte.rte}, Unit: ${elem.pow.unt.nmunt}, Bill: ${elem.billamnt}`,
				id: elem._id.toString(),
				status: elem.pow.nmmtr
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.powerTransactionResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.powerTransactionResult.length) {
			this.selection.clear();
		} else {
			this.powerTransactionResult.forEach(row => this.selection.select(row));
		}
	}
	
	editPowerTransaction(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewPowerTransaction(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}


	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	export(){
		this.service.exportExcel();
	}
}
