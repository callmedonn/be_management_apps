import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AccountBankModel } from './accountBank.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {QueryResultsModel} from '../../../_base/crud';

import * as FileSaver from 'file-saver';
import { QueryAccountBankModel } from './queryaccountBank.model';

const API_ACCOUNT_BANK_URL = `${environment.baseAPI}/api/bankacct`;
const API_CSV = `${environment.baseAPI}/api/excel/accountBank/export`;



@Injectable({
	providedIn: 'root'
})
export class AccountBankService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListAccountBank(queryParams: QueryAccountBankModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let params = new URLSearchParams();
		params.set("param", JSON.stringify(queryParams));
		return this.http.get<QueryResultsModel>(API_ACCOUNT_BANK_URL + '/list?' + params,{ headers: httpHeaders });
	}
	findAccountBankById(_id: string): Observable<AccountBankModel>{
		return this.http.get<AccountBankModel>(`${API_ACCOUNT_BANK_URL}/${_id}`);
	}
	deleteAccountBank(accountBankId: string) {
		const url = `${API_ACCOUNT_BANK_URL}/delete/${accountBankId}`;
		return this.http.delete(url);
	}
	updateAccountBank(accountBank: AccountBankModel) {
		const url = `${API_ACCOUNT_BANK_URL}/edit/${accountBank._id}`;
		return this.http.patch(url, accountBank);
	}
	createAccountBank(accountBank: AccountBankModel): Observable<AccountBankModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<AccountBankModel>(`${API_ACCOUNT_BANK_URL}/add`, accountBank, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_CSV}`, "export-accountBank.xlsx");
	}
}
