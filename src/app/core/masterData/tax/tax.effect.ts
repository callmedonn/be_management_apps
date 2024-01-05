// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { TaxService } from './tax.service';
// State
import { AppState } from '../../../core/reducers';
import {
	TaxActionTypes,
	TaxPageRequested,
	TaxPageLoaded,
	TaxCreated,
	TaxDeleted,
	TaxUpdated,
	TaxOnServerCreated,
	TaxActionToggleLoading,
	TaxPageToggleLoading
} from './tax.action';
import { QueryTaxModel } from './querytax.model';


@Injectable()
export class TaxEffect {
	showPageLoadingDistpatcher = new TaxPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new TaxPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new TaxActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new TaxActionToggleLoading({ isLoading: false });

	@Effect()
	loadTaxPage$ = this.actions$
		.pipe(
			ofType<TaxPageRequested>(TaxActionTypes.TaxPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.tax.getListTax(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryTaxModel = response[1];
				return new TaxPageLoaded({
					tax: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteTax$ = this.actions$
		.pipe(
			ofType<TaxDeleted>(TaxActionTypes.TaxDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.tax.deleteTax(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateTax = this.actions$
		.pipe(
			ofType<TaxUpdated>(TaxActionTypes.TaxUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.tax.updateTax(payload.tax);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<TaxOnServerCreated>(TaxActionTypes.TaxOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.tax.createTax(payload.tax).pipe(
					tap(res => {
						this.store.dispatch(new TaxCreated({ tax: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private tax: TaxService, private store: Store<AppState>) { }
}
