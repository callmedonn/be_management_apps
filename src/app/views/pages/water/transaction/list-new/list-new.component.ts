import {Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, } from 'rxjs/operators';
import { fromEvent, merge, Subscription } from 'rxjs';
import { Store,  } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import {WaterTransactionDataSource} from "../../../../../core/water/transaction/transcation.datasource";
import {WaterTransactionModel} from "../../../../../core/water/transaction/transaction.model";
import {SubheaderService} from "../../../../../core/_base/layout";
import {WaterTransactionService} from "../../../../../core/water/transaction/transaction.service";
import {WaterTransactionDeleted, WaterTransactionPageUnpost} from "../../../../../core/water/transaction/transaction.action";
import { QueryWaterTransactionModel } from '../../../../../core/water/transaction/querytransaction.model';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';

@Component({
  	selector: 'kt-list-transaction',
  	templateUrl: './list-new.component.html',
  	styleUrls: ['./list-new.component.scss']
})
export class ListNew implements OnInit, OnDestroy {
	file;
	dataSource: WaterTransactionDataSource;
	displayedColumns = ['select', 'watname', 'unit', 'startpos', 'endpos', 'billmonth', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<WaterTransactionModel>(true, []);
	waterTransactionResult: WaterTransactionModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	private subscriptions: Subscription[] = [];
  	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: WaterTransactionService,
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
				this.loadWaterTransactionList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150), 
			distinctUntilChanged(), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadWaterTransactionList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Water Consumption');

		this.dataSource = new WaterTransactionDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.waterTransactionResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		this.loadWaterTransactionList();

	  }
	  
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		
	  	filter.watname = `${searchText}`;
		return filter;
	}

	loadWaterTransactionList() {
		this.selection.clear();
		const queryParams = new QueryWaterTransactionModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new WaterTransactionPageUnpost({ page: queryParams }));
		this.selection.clear();
	}

	deleteWaterTransaction(_item: WaterTransactionModel) {
		const _title = 'Water Consumption Delete';
		const _description = 'Are you sure to permanently delete this water consumption?';
		const _waitDesciption = 'Water consumption is deleting...';
		const _deleteMessage = `Water consumption has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.store.dispatch(new WaterTransactionDeleted({ id: _item._id }));
			this.ngOnInit();
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}


	fetchPowerTransaction() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.wat.nmmtr} , Rate: Rp. ${elem.wat.rte.rte}, Unit: ${elem.wat.unt.nmunt}, Bill: ${elem.billamnt}`,
				id: elem._id.toString(),
				status: elem.wat.nmmtr
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.waterTransactionResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.waterTransactionResult.length) {
			this.selection.clear();
		} else {
			this.waterTransactionResult.forEach(row => this.selection.select(row));
		}
	}
	editWaterTransaction(id) {
		this.router.navigate(['/water-management/water/transaction/edit', id], { relativeTo: this.activatedRoute });
	}

	postingAll(WaterTransactionModel){
		this.service.postingAll(WaterTransactionModel);
	}

  	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
	
	auto() {
		const API_WATER_TRANSACTION_URL = `${environment.baseAPI}/api/water/transaksi/posting`;
		var data_url = this.http.patch(`${API_WATER_TRANSACTION_URL}`, {
			})
			.subscribe(
				res => {
					const message = `Auto Posting successfully has been successfully.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
					const url = `/water-management/water/transaction/new`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
					this.ngOnInit();
				},
				err => {
					console.error(err);
					const message = 'Error while adding billing | ' + err.statusText;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
				}
			);
			this.ngOnInit();
	}

	export(){
		this.service.exportExcel();
	}


}
