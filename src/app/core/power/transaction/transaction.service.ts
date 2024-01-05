import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PowerTransactionModel } from './transaction.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';
import { QueryParamsModel } from '../../_base/crud/models/query-models/query-params.model';
import { QueryPowerTransactionModel } from './querytransaction.model';
import * as FileSaver from 'file-saver';
import {HttpParams} from '@angular/common/http';

const API_POWER_TRANSACTION_URL = `${environment.baseAPI}/api/power/transaksi`;
const API_POWER_EXPORT_URL = `${environment.baseAPI}/api/excel/export/electricity/consumption`;

@Injectable({
	providedIn: 'root'
})
export class PowerTransactionService {
	constructor(private http: HttpClient) {}
	// get list block group
	
	getListPowerTransaction(queryParams: QueryPowerTransactionModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_POWER_TRANSACTION_URL}`);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_POWER_TRANSACTION_URL + '/list?' + params,{ headers: httpHeaders });
	}

	getListPowerTransactionUnpost(queryParams: QueryPowerTransactionModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_POWER_TRANSACTION_URL}`);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_POWER_TRANSACTION_URL + '/unpost?' + params,{ headers: httpHeaders });
	}
	
	deletePowerTransaction(powerTransactionId: string) {
		const url = `${API_POWER_TRANSACTION_URL}/delete/${powerTransactionId}`;
		return this.http.delete(url);
	}
	
	getPowerTransactionUnit(unitId: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_POWER_TRANSACTION_URL}/unit/${unitId}`);
	}

	updatePowerTransaction(powerTransaction: PowerTransactionModel) {
		const url = `${API_POWER_TRANSACTION_URL}/edit/${powerTransaction._id}`;
		return this.http.patch(url, powerTransaction);
	}
	createPowerTransaction(powerTransaction: PowerTransactionModel): Observable<PowerTransactionModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PowerTransactionModel>(`${API_POWER_TRANSACTION_URL}/add`, powerTransaction, { headers: httpHeaders});
	}

	findPowbillById(_id: string): Observable<any>{
		return this.http.get<any>(`${API_POWER_TRANSACTION_URL}/${_id}`);
	}

	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	exportExcel(){
		return FileSaver.saveAs(`${API_POWER_EXPORT_URL}`, "export-electricity-consumption.xlsx");
	}
	
}
