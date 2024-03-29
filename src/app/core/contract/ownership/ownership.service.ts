import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { OwnershipContractModel } from './ownership.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';

import * as FileSaver from 'file-saver';
import {HttpParams} from '@angular/common/http';
import { QueryOwnerTransactionModel } from './queryowner.model';

const API_EXCEL = `${environment.baseAPI}/api/excel/owner/export`;
const API_OWNERSHIP_URL = `${environment.baseAPI}/api/contract/ownership`;
const API_ALL_UNIT =`${environment.baseAPI}/api/contract`;


@Injectable({
	providedIn: 'root'
})

export class OwnershipContractService {
	constructor(private http: HttpClient) {}

	exportExcel(){
		return FileSaver.saveAs(`${API_EXCEL}`, "export-ownership.xlsx");
	}

	// get list block group
	getListOwnershipContract(queryParams: QueryOwnerTransactionModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_OWNERSHIP_URL + '/list?' + params,{ headers: httpHeaders });
	}


	getListPPContract(queryParams: QueryOwnerTransactionModel): Observable<QueryResultsModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		let options = {
			param: JSON.stringify(queryParams)
		}
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key])
		}
		return this.http.get<QueryResultsModel>(API_OWNERSHIP_URL + '/list/pp?' + params,{ headers: httpHeaders });
	}
	

	getAllDataUnit(queryParams: QueryOwnerTransactionModel): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_ALL_UNIT}/listUnitContract`);
	}


	

	// findUnitById(id: string): Observable<any>{
	// 	return this.http.get<any>(`${API_ALL_UNIT}/listUnitUser/${id}`);
	// }


	findOwnershipContractByParent(_id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_OWNERSHIP_URL}/parent/${_id}`);
	}
	

	findOwnershipContractByUnit(_id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_OWNERSHIP_URL}/unit/${_id}`);
	}

	deleteOwnershipContract(ownershipcontractId: string) {
		const url = `${API_OWNERSHIP_URL}/delete/${ownershipcontractId}`;
		return this.http.delete(url);
	}

	findOwneshipById(id: string): Observable<any>{
		return this.http.get<any>(`${API_OWNERSHIP_URL}/${id}`);
	}
	
	updateOwnershipContract(ownershipcontract: OwnershipContractModel) {
		const url = `${API_OWNERSHIP_URL}/edit/${ownershipcontract._id}`;
		return this.http.patch(url, ownershipcontract);
	}
	createOwnershipContract(ownershipcontract: OwnershipContractModel): Observable<OwnershipContractModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<OwnershipContractModel>(`${API_OWNERSHIP_URL}/add`, ownershipcontract, { headers: httpHeaders});
	}

	getParentByUnit(id: string): Observable<any>{
		return this.http.get<any>(`${API_OWNERSHIP_URL}/parent/${id}`);
	}
	getOwnershipContractNumber(unit_id: string): Observable<QueryResultsModel>{
		return this.http.get<QueryResultsModel>(`${API_OWNERSHIP_URL}/generate/${unit_id}`);
	}
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
