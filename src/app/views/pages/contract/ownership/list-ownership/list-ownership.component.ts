import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap, skip, take, delay } from 'rxjs/operators';
import { fromEvent, merge, Observable, of, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../../core/reducers';
import { LayoutUtilsService, MessageType, QueryParamsModel } from '../../../../../core/_base/crud';
import { OwnershipContractModel } from '../../../../../core/contract/ownership/ownership.model';
import { OwnershipContractDataSource } from '../../../../../core/contract/ownership/ownership.datasource';
import { OwnershipContractDeleted, OwnershipContractPageRequested } from '../../../../../core/contract/ownership/ownership.action';
import { SubheaderService } from '../../../../../core/_base/layout';
import { OwnershipContractService } from '../../../../../core/contract/ownership/ownership.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { QueryOwnerTransactionModel } from '../../../../../core/contract/ownership/queryowner.model';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'kt-list-ownership',
  templateUrl: './list-ownership.component.html',
  styleUrls: ['./list-ownership.component.scss']
})
export class ListOwnershipComponent implements OnInit, OnDestroy {
	file;
	dataSource: OwnershipContractDataSource;
	displayedColumns = ['print','contract_number','customername', 'unit', 'contract_date', 'expiry_date',   'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryOwnerTransactionModel;
	selection = new SelectionModel<OwnershipContractModel>(true, []);
	ownershipResult: OwnershipContractModel[] = [];
	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role


	private subscriptions: Subscription[] = [];

	/**
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param store: Store<AppState>
	 * @param router: Router
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param subheaderService: SubheaderService
	 */
	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store<AppState>,
		private router: Router,
		private service: OwnershipContractService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private modalService : NgbModal,
		private http : HttpClient,

		) { }
		
	ngOnInit() {
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadOwnershipList();
			})
		).subscribe();
		this.subscriptions.push(paginatorSubscriptions);

		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			debounceTime(150), 
			distinctUntilChanged(), 
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadOwnershipList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle('Ownership Contract');
		this.dataSource = new OwnershipContractDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.ownershipResult = res;
		});
		this.subscriptions.push(entitiesSubscription);
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { 
			this.loadOwnershipList();
		});
		this.loadOwnershipList();
	}

	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadOwnershipList() {
		this.selection.clear();
		const queryParams = new QueryOwnerTransactionModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new OwnershipContractPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: number = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 =  `${searchText}`;
		return filter;
	}

	deleteOwnership(_item: OwnershipContractModel) {
		const _title = 'Ownership Contract Delete';
		const _description = 'Are you sure to permanently delete this ownership contract?';
		const _waitDesciption = 'Ownership contract is deleting...';
		const _deleteMessage = `Ownership contract has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OwnershipContractDeleted({ id: _item._id }));
			this.ngOnInit()
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	fetchOwnership() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem.contract_number} , ${elem.contract_date}`,
				id: elem._id.toString(),
				status: elem.contract_number
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}

	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.ownershipResult.length;
		return numSelected === numRows;
	}

	masterToggle() {
		if (this.selection.selected.length === this.ownershipResult.length) {
			this.selection.clear();
		} else {
			this.ownershipResult.forEach(row => this.selection.select(row));
		}
	}

	editOwnership(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}

	viewOwnership(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	export(){
		this.service.exportExcel();
	}


	printOwn(id) {
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/contract/ownership`;

		var mediaType = "application/pdf";
			this.http
				.get(`${API_DEPOSIT_URL}/getown/${id}`, {
					responseType: "arraybuffer",
				})
				.subscribe(
					(response) => {
						let blob = new Blob([response], { type: mediaType });
						var fileURL = URL.createObjectURL(blob);
						window.open(fileURL, '_blank');
					},
					(e) => {
						console.error(e);
					}
				);
	}

}
