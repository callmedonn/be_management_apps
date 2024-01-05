import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TaxModel } from './tax.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryTaxModel } from './querytax.model';

const API_FLOOR_URL = `${environment.baseAPI}/api/tax`;
const API_CSV = `${environment.baseAPI}/api/excel/tax/export`;




@Injectable({
	providedIn: 'root'
})
export class TaxService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListTax(queryParams: QueryTaxModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_FLOOR_URL + '/list?' + params,{ headers: httpHeaders });
	}

	
	findTaxById(_id: string): Observable<TaxModel>{
		return this.http.get<TaxModel>(`${API_FLOOR_URL}/${_id}`);
	}
	deleteTax(taxId: string) {
		const url = `${API_FLOOR_URL}/delete/${taxId}`;
		return this.http.delete(url);
	}
	updateTax(tax: TaxModel) {
		const url = `${API_FLOOR_URL}/edit/${tax._id}`;
		return this.http.patch(url, tax);
	}
	createTax(tax: TaxModel): Observable<TaxModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<TaxModel>(`${API_FLOOR_URL}/add`, tax, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-tax.xlsx");
	}
}
