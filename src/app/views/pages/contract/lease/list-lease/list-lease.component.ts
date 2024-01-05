import { AfterViewInit, AfterViewChecked } from '@angular/core';
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
import { AppState } from '../../../../../core/reducers';

// Services
import { LayoutUtilsService, MessageType} from '../../../../../core/_base/crud';
import { LeaseContractModel } from '../../../../../core/contract/lease/lease.model';
import { LeaseContractDataSource } from '../../../../../core/contract/lease/lease.datasource';
import { LeaseContractDeleted, LeaseContractPageRequested } from '../../../../../core/contract/lease/lease.action';
import { SubheaderService } from '../../../../../core/_base/layout';
import { QueryleaseModel } from '../../../../../core/contract/lease/querylease.model';
import { CustomerModel } from '../../../../../core/customer/customer.model';
import { LeaseContractService } from '../../../../../core/contract/lease/lease.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';


@Component({
  selector: 'kt-list-lease',
  templateUrl: './list-lease.component.html',
  styleUrls: ['./list-lease.component.scss']
})
export class ListLeaseComponent implements OnInit, OnDestroy {
	file;
	dataSource: LeaseContractDataSource;
	displayedColumns = ['print', 'contract_number', 'customername', 'unit','contract_date','expiry_date',  'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild('sort1', {static: true}) sort: MatSort;
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	lastQuery: QueryleaseModel;
	selection = new SelectionModel<LeaseContractModel>(true, []);
	leaseResult: LeaseContractModel[] = [];
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
		private service: LeaseContractService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private cdr: ChangeDetectorRef,
		private http : HttpClient,
		private modalService : NgbModal,
		) { }
		

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.subscriptions.push(sortSubscription);

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		const paginatorSubscriptions = merge(this.sort.sortChange, this.paginator.page).pipe(
			tap(() => {
				this.loadLeaseList();
			})
		).subscribe();
		this.subscriptions.push(paginatorSubscriptions);


		// Filtration, bind to searchInput
		const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			// tslint:disable-next-line:max-line-length
			debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
			distinctUntilChanged(), // This operator will eliminate duplicate values
			tap(() => {
				this.paginator.pageIndex = 0;
				this.loadLeaseList();
			})
		).subscribe();
		this.subscriptions.push(searchSubscription);

		// Set title to page breadCrumbs
		this.subheaderService.setTitle('Tenant Contract');

		// Init DataSource
		this.dataSource = new LeaseContractDataSource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject.pipe(
			skip(1),
			distinctUntilChanged()
		).subscribe(res => {
			this.leaseResult = res;
		});
		this.subscriptions.push(entitiesSubscription);

		// First Load
		of(undefined).pipe(take(1), delay(1000)).subscribe(() => { // Remove this line, just loading imitation
			this.loadLeaseList();
		});
		this.loadLeaseList();
	}

	ngOnDestroy(){
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	loadLeaseList() {
		this.selection.clear();
		const queryParams = new QueryleaseModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex+1,
			this.paginator.pageSize
		);
		this.store.dispatch(new LeaseContractPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();

		filter.unit2 =  `${searchText}`;
		return filter;
	}

	deleteLease(_item: LeaseContractModel) {
		// tslint:disable-next-line:variable-name
		const _title = 'Tenant Contract Delete';
		// tslint:disable-next-line:variable-name
		const _description = 'Are you sure to permanently delete this tenant contract?';
		const _waitDesciption = 'Tenant contract is deleting...';
		const _deleteMessage = `Tenant contract has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new LeaseContractDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}


	masterToggle() {
		if (this.selection.selected.length === this.leaseResult.length) {
			this.selection.clear();
		} else {
			this.leaseResult.forEach(row => this.selection.select(row));
		}
	}

	editLease(id) {
		this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
	}
	viewLease(id) {
		this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
	}

	export(){
		this.service.exportExcel();
	}


	printOwn(id) {
		const API_DEPOSIT_URL = `${environment.baseAPI}/api/contract/lease`;

		var mediaType = "application/pdf";
			this.http
				.get(`${API_DEPOSIT_URL}/getlease/${id}`, {
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
