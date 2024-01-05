// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectTaxInStore, selectTaxPageLoading, selectTaxShowInitWaitingMessage } from './tax.selector';


export class TaxDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTaxPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTaxShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTaxInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
