import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PowerMeterModel } from './meter.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {QueryResultsModel} from '../../_base/crud';
import { QueryPowerMeterModel } from './querymeter.model';
import * as FileSaver from 'file-saver';

const API_EXCEL = `${environment.baseAPI}/api/excel/powermas/export`;
const API_POWER_RATE_URL = `${environment.baseAPI}/api/power/master`;




@Injectable({
	providedIn: 'root'
})
export class PowerMeterService {
	constructor(private http: HttpClient) {}
	// get list block group
	getListPowerMeter(queryParams: QueryPowerMeterModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_POWER_RATE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_POWER_RATE_URL + '/list?' + params,{ headers: httpHeaders });
	}


	
	getListPowerMeterforTr(queryParams: QueryPowerMeterModel): Observable<QueryResultsModel>{
		// return this.http.get<QueryResultsModel>(`${API_POWER_RATE_URL}`);
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
		return this.http.get<QueryResultsModel>(API_POWER_RATE_URL + '/listforTr?' + params,{ headers: httpHeaders });
	}

	getPowerMeter(id: string): Observable<any>{
		return this.http.get<any>(`${API_POWER_RATE_URL}/${id}`);
	}
	

	findMeterByUnitId(_id: string): Observable<any>{
		return this.http.get<any>(`${API_POWER_RATE_URL}/meterunit/${_id}`);
	}

	
	deletePowerMeter(powerMeterId: string) {
		const url = `${API_POWER_RATE_URL}/delete/${powerMeterId}`;
		return this.http.delete(url);
	}
	updatePowerMeter(powerMeter: PowerMeterModel) {
		const url = `${API_POWER_RATE_URL}/edit/${powerMeter._id}`;
		return this.http.patch(url, powerMeter);
	}
	createPowerMeter(powerMeter: PowerMeterModel): Observable<PowerMeterModel>{
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<PowerMeterModel>(`${API_POWER_RATE_URL}/add`, powerMeter, { headers: httpHeaders});
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
		return FileSaver.saveAs(`${API_EXCEL}`, "export-powermeter.xlsx");
	}

}
