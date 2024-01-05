// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { PowerTransactionState } from './transaction.reducer';
import { each } from 'lodash';
import { PowerTransactionModel } from './transaction.model';


export const selectPowerTransactionState = createFeatureSelector<PowerTransactionState>('powerTransaction');

export const selectPowerTransactionById = (powerTransactionId: string) => createSelector(
	selectPowerTransactionState,
	powerTransactionState =>  powerTransactionState.entities[powerTransactionId]
);

export const selectPowerTransactionPageLoading = createSelector(
	selectPowerTransactionState,
	powerTransactionState => {
		return powerTransactionState.listLoading;
	}
);

export const selectPowerTransactionActionLoading = createSelector(
	selectPowerTransactionState,
	powerTransactionState => powerTransactionState.actionsloading
);

export const selectLastCreatedPowerTransactionId = createSelector(
	selectPowerTransactionState,
	powerTransactionState => powerTransactionState.lastCreatedPowerTransactionId
);

export const selectPowerTransactionPageLastQuery = createSelector(
	selectPowerTransactionState,
	powerTransactionState => powerTransactionState.lastQuery
);

export const selectPowerTransactionInStore = createSelector(
	selectPowerTransactionState,
	powerTransactionState => {
		const items: PowerTransactionModel[] = [];
		each(powerTransactionState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PowerTransactionModel[] = httpExtension.sortArray(items, powerTransactionState.lastQuery.sortField, powerTransactionState.lastQuery.sortOrder);
		return new QueryResultsModel(result, powerTransactionState.totalCount, '');
	}
);

export const selectPowerTransactionShowInitWaitingMessage = createSelector(
	selectPowerTransactionState,
	powerTransactionState => powerTransactionState.showInitWaitingMessage
);

export const selectHasPowerTransactionInStore = createSelector(
	selectPowerTransactionState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
