import {Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
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
import { AppState } from '../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType} from '../../../../../core/_base/crud';
import {PowerTransactionDataSource} from "../../../../../core/power/transaction/transaction.datasource";
import {PowerTransactionModel} from "../../../../../core/power/transaction/transaction.model";
import {SubheaderService} from "../../../../../core/_base/layout";
import {PowerTransactionService} from "../../../../../core/power/transaction/transaction.service";
import {PowerTransactionDeleted, PowerTransactionPageRequested, PowerTransactionPageRequestedUnpost} from "../../../../../core/power/transaction/transaction.action";
import { QueryPowerTransactionModel } from '../../../../../core/power/transaction/querytransaction.model';
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
	dataSource: PowerTransactionDataSource;
	displayedColumns = ['select', 'powname', 'unit', 'strtpos', 'endpos', 'billmnt', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryPowerTransactionModel;
	// Selection
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
		private http: HttpClient,
		private service: PowerTransactionService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private modalService: NgbModal,
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
				this.loadPowerTransactionList();
			})
		)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadPowerTransactionList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Electricity Consumption');

		// Init DataSource
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
		this.store.dispatch(new PowerTransactionPageRequestedUnpost({ page: queryParams }));
		this.selection.clear();
	}
	deletePowerTransaction(_item: PowerTransactionModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Electricity Consumption Delete';
		// tslint:disable-next-line:variable-name
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
		this.router.navigate(['/power-management/power/transaction/edit', id], { relativeTo: this.activatedRoute });
	}
	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	auto() {
		const API_WATER_TRANSACTION_URL = `${environment.baseAPI}/api/power/transaksi/posting`;
		var data_url = this.http.patch(`${API_WATER_TRANSACTION_URL}`, {
			})
			.subscribe(
				res => {
					const message = `Auto Posting successfully has been successfully.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
					const url = `/power-management/power/transaction/new`;
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

	openLarge(content) {
		this.modalService.open(content, {
			size: 'lg'
		});
	}

	selectFile(event) {
		if(event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	
	onSubmit(){
		const formData = new FormData();
		formData.append('file', this.file);

		this.http.post<any>(`${environment.baseAPI}/api/excel/watermas/import`, formData).subscribe(
			res =>{
				const message = `file successfully has been import.`;
	 			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
				this.ngOnInit();
			},
			err => {
				console.error(err);
				const message = 'Error while importing File | ' + err.statusText;
				this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
				}
		)
	}
}
