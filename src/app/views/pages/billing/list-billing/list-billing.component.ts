import { HttpClient } from "@angular/common/http";
import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	OnDestroy,
	ChangeDetectorRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { MatPaginator, MatSort } from "@angular/material";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import {
	debounceTime,
	distinctUntilChanged,
	tap,
	skip,
} from "rxjs/operators";
import { fromEvent, merge, Subscription } from "rxjs";
import { Store, select } from "@ngrx/store";
import { AppState } from "../../../../core/reducers";
import {
	LayoutUtilsService,
	MessageType,
	QueryParamsModel,
} from "../../../../core/_base/crud";
import { BillingModel } from "../../../../core/billing/billing.model";
import { BillingDatasource } from "../../../../core/billing/billing.datasource";
import {
	BillingDeleted,
	BillingPageRequested,
} from "../../../../core/billing/billing.action";
import { SubheaderService } from "../../../../core/_base/layout";
import { BillingService } from "../../../../core/billing/billing.service";
import {
	MomentDateAdapter,
} from "@angular/material-moment-adapter";
import {
	DateAdapter,
	MAT_DATE_FORMATS,
	MAT_DATE_LOCALE,
} from "@angular/material";
import * as _moment from "moment";
import { default as _rollupMoment, } from "moment";
import { selectBillingById } from "../../../../core/billing/billing.selector";
import { environment } from "../../../../../environments/environment";
const moment = _rollupMoment || _moment;

const MY_FORMATS = {
	parse: {
		dateInput: "LL",
	},
	display: {
		dateInput: "YYYY-MM-DD",
		monthYearLabel: "YYYY",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "YYYY",
	},
};

@Component({
	selector: "kt-list-billing",
	templateUrl: "./list-billing.component.html",
	styleUrls: ["./list-billing.component.scss"],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class ListBillingComponent implements OnInit, OnDestroy {
	file;
	periode_date = new Date;
	download_name: string;
	@ViewChild("pdfViewer", { static: true }) pdfViewer: ElementRef;
	dataSource: BillingDatasource;
	displayedColumns = [
		"prnt",
		"billing_number",
		"billedTo",
		"Unit",
		"billing_date",
		"due_date",
		"totalBilling",
		"isPaid",
		"actions",
	];

	data = localStorage.getItem("currentUser");
	dataUser = JSON.parse(this.data)
	role = this.dataUser.role
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild("sort1", { static: true }) sort: MatSort;
	@ViewChild("searchInput", { static: true }) searchInput: ElementRef;
	lastQuery: QueryParamsModel;
	selection = new SelectionModel<BillingModel>(true, []);
	billingResult: BillingModel[] = [];
	closeResult: string;
	billing : BillingModel;
	hari = new Date();
	year
	unit
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
		private service: BillingService,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		private http: HttpClient,
		private modalService: NgbModal,
		private cdr: ChangeDetectorRef
	) {}
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		const sortSubscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);

		const paginatorSubscriptions = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(
				tap(() => {
					this.loadBillingList();
				})
			)
			.subscribe();
		this.subscriptions.push(paginatorSubscriptions);
		const searchSubscription = fromEvent(
			this.searchInput.nativeElement,
			"keyup"
		)
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadBillingList();
				})
			)
			.subscribe();
		this.subscriptions.push(searchSubscription);
		this.subheaderService.setTitle("IPL Billing");
		this.dataSource = new BillingDatasource(this.store);
		const entitiesSubscription = this.dataSource.entitySubject
			.pipe(skip(1), distinctUntilChanged())
			.subscribe((res) => {
				this.billingResult = res;
			});
		this.subscriptions.push(entitiesSubscription);
		this.loadBillingList();
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}
	
	loadBillingList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex + 1,
			this.paginator.pageSize
		);
		this.store.dispatch(new BillingPageRequested({ page: queryParams }));
		this.selection.clear();
	}

	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value.toLowerCase();
		filter.unit2 = `${searchText}`;
		return filter;
	}


	deleteBilling(_item: BillingModel) {
		const _title = "Billing Delete";
		const _description = "Are you sure to permanently delete this billing?";
		const _waitDesciption = "Billing is deleting...";
		const _deleteMessage = `Billing has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}

			this.store.dispatch(new BillingDeleted({ id: _item._id }));
			this.layoutUtilsService.showActionNotification(
				_deleteMessage,
				MessageType.Delete
			);
			window.location = window.location;
		});
	}

	masterToggle() {
		if (this.selection.selected.length === this.billingResult.length) {
			this.selection.clear();
		} else {
			this.billingResult.forEach((row) => this.selection.select(row));
		}
	}

	editBilling(id) {
		this.router.navigate(["edit", id], { relativeTo: this.activatedRoute });
	}

	viewBilling(id) {
		this.router.navigate(["view", id], { relativeTo: this.activatedRoute });
	}

	printBilling(id) {
		const API_BILLING_URL = `${environment.baseAPI}/api/billing`;
		if (id) {
			this.store.pipe(select(selectBillingById(id))).subscribe(res => {
				if (res) {
					this.billing = res;
					console.log(res)
					this.hari = new Date(this.billing.created_date)
					this.year  = this.hari.getFullYear();
					this.unit = this.billing.unit2
					console.log(typeof this.unit)
				}
			});
		}
		
		if (this.billing.pinalty <= 0){
		var mediaType = "application/pdf";
		this.http
			.get(`${API_BILLING_URL}/create/${id}`, {
				responseType: "arraybuffer",
			})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					var anchor = document.createElement("a");
					anchor.download =  this.unit + "_" + this.year + "_" + this.billing.billing_number  + ".pdf";
					anchor.href = fileURL;
					anchor.click();
					// window.open(fileURL, "_blank")
					// const src = fileURL;
					this.pdfViewer.nativeElement.data = fileURL;
				},
				(e) => {
					console.error(e);
				}
			);
		}else
		{
		var mediaType = "application/pdf";
		this.http
			.get(`${API_BILLING_URL}/create/pinalty/${id}`, {
				responseType: "arraybuffer",
			})
			.subscribe(
				(response) => {
					let blob = new Blob([response], { type: mediaType });
					var fileURL = URL.createObjectURL(blob);
					var anchor = document.createElement("a");
					// anchor.download = this.download_name + ".pdf";
					// anchor.href = fileURL;
					anchor.click();
					window.open(fileURL, "_blank")
					// const src = fileURL;
					this.pdfViewer.nativeElement.data = fileURL;
				},
				(e) => {
					console.error(e);
				}
			);
		}
	}

	open(content) {
		this.modalService.open(content).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			}
		);
	}
	
	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return "by pressing ESC";
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return "by clicking on a backdrop";
		} else {
			return `with: ${reason}`;
		}
	}

	openLarge(content) {
		this.modalService.open(content, {
			size: "lg",
		});
	}


	auto() {
		const API_BILLING_URL = `${environment.baseAPI}/api/billing/autocreate`;
		var data_url = this.http
			.post(`${API_BILLING_URL}`, {
				date: this.periode_date,
			})
			.subscribe(
				res => {
					const message = `Auto Generate successfully has been added.`;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
					const url = `/billing`;
					this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
					this.ngOnInit();
				},
				err => {
					console.error(err);
					const message = 'Error while adding billing | ' + err.statusText;
					this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, false);
				}
			);
		
	}

	changePeriode(event) {
		this.periode_date = event.value;
		console.log(event.value);
	}

	selectFile(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.file = file;
		}
	}

	
	export(){
		this.service.exportExcel();
	}
	
	// Class list for list by status
	_getStatusClass(status: boolean, date: string) {
		
		const diff = this.calculateDay(new Date(date));
		
		return {
			'chip': true,
			'chip--success': status,
			'chip--danger': !status && (diff <= -7),
			'chip--warning': !status && (diff <= 0 && diff > -7 )
		}
	}

	calculateDay(date: Date): number {
		const now = new Date().getTime();
		const due = date.getTime();

		const diffInTime = due - now;
		const diffInDay = diffInTime / (1000 * 3600 * 24);
		
		return parseInt(diffInDay.toFixed());
	}
}
