// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectPowerTransactionInStore, selectPowerTransactionPageLoading, selectPowerTransactionShowInitWaitingMessage } from './transaction.selector';


export class PowerTransactionDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPowerTransactionPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPowerTransactionShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPowerTransactionInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
