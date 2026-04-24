import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private url = '/covid19/live/country/india/status/confirmed';
  private countryList = '/covid19/countries';
  private covid19indiaorgUrl = '/api/data.json';
  private stateDistrictData = '/api/state_district_wise.json';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(this.covid19indiaorgUrl);
  }

  getCountries(): Observable<any> {
    return this.http.get<any>(this.countryList);
  }

  getSelectedCountryStats(value: string): Observable<any> {
    return this.http.get<any>(`/covid19/live/country/${value}/status/confirmed`);
  }

  getStateData(): Observable<any> {
    return this.http.get<any>(this.stateDistrictData);
  }
}
