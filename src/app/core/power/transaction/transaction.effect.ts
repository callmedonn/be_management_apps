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

// State
import { AppState } from '../../../core/reducers';
import {
	PowerTransactionActionTypes,
	PowerTransactionPageRequested,
	PowerTransactionPageLoaded,
	PowerTransactionCreated,
	PowerTransactionDeleted,
	PowerTransactionUpdated,
	PowerTransactionOnServerCreated,
	PowerTransactionActionToggleLoading,
	PowerTransactionPageToggleLoading,
	PowerTransactionPageRequestedUnpost,
	PowerTransactionPageLoadedUnpost
} from './transaction.action';

import { PowerTransactionService } from './transaction.service';
import { QueryPowerTransactionModel } from './querytransaction.model';

@Injectable()
export class PowerTransactionEffect {
	showPageLoadingDistpatcher = new PowerTransactionPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PowerTransactionPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PowerTransactionActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PowerTransactionActionToggleLoading({ isLoading: false });


	@Effect()
	loadPowerTransactionPage$ = this.actions$
		.pipe(
			ofType<PowerTransactionPageRequested>(PowerTransactionActionTypes.PowerTransactionPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.powertransaction.getListPowerTransaction(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
				const lastQuery: QueryPowerTransactionModel = response[1];
				return new PowerTransactionPageLoaded({
					powertransaction: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

		@Effect()
		loadPowerTransactionPageUnpost$ = this.actions$
			.pipe(
				ofType<PowerTransactionPageRequestedUnpost>(PowerTransactionActionTypes.PowerTransactionPageRequestedUnpost),
				mergeMap(( { payload } ) => {
					this.store.dispatch(this.showPageLoadingDistpatcher);
					const requestToServer = this.powertransaction.getListPowerTransactionUnpost(payload.page);
					const lastQuery = of(payload.page);
					return forkJoin(requestToServer, lastQuery);
				}),
				map(response => {
					let res: { errorMessage: string; totalCount: any; items: any };
					const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: '', data: [] };
					const lastQuery: QueryPowerTransactionModel = response[1];
					return new PowerTransactionPageLoadedUnpost({
						powertransaction: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}),
			);

	@Effect()
	deletePowerTransaction$ = this.actions$
		.pipe(
			ofType<PowerTransactionDeleted>(PowerTransactionActionTypes.PowerTransactionDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.powertransaction.deletePowerTransaction(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePowerTransaction = this.actions$
		.pipe(
			ofType<PowerTransactionUpdated>(PowerTransactionActionTypes.PowerTransactionUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powertransaction.updatePowerTransaction(payload.powertransaction);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PowerTransactionOnServerCreated>(PowerTransactionActionTypes.PowerTransactionOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.powertransaction.createPowerTransaction(payload.powertransaction).pipe(
					tap(res => {
						this.store.dispatch(new PowerTransactionCreated({ powertransaction: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private powertransaction: PowerTransactionService, private store: Store<AppState>) { }
}
