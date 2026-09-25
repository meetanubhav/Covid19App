import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, retry, shareReplay, timeout } from 'rxjs/operators';

/**
 * All data comes from the open disease.sh API (https://disease.sh), which is
 * CORS-enabled and works directly from GitHub Pages.
 *
 * The previous sources (api.covid19india.org and api.covid19api.com) have been
 * shut down, and the dev-server proxy used on `main` does not exist on a static
 * host, which is why the dashboard was stuck on "Loading...".
 */
const API = 'https://disease.sh/v3/covid-19';
const REQUEST_TIMEOUT_MS = 15000;

export interface Totals {
  cases: number;
  active: number;
  recovered: number;
  deaths: number;
  todayCases: number;
  todayActive: number;
  todayRecovered: number;
  todayDeaths: number;
}

export interface StateRow extends Totals {
  state: string;
}

export interface IndiaSummary {
  updated: number;
  total: Totals;
  states: StateRow[];
}

export interface CountryStats {
  country: string;
  flag: string;
  updated: number;
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  active: number;
  population: number;
}

export interface TimePoint {
  date: Date;
  value: number;
}

export interface IndiaHistory {
  cases: TimePoint[];
  recovered: TimePoint[];
  deaths: TimePoint[];
}

@Injectable({ providedIn: 'root' })
export class DataService {

  private india$?: Observable<IndiaSummary>;
  private countries$?: Observable<CountryStats[]>;
  private history$?: Observable<IndiaHistory>;

  constructor(private http: HttpClient) { }

  /** National totals + state-wise breakdown for India. */
  getIndia(force = false): Observable<IndiaSummary> {
    if (!this.india$ || force) {
      this.india$ = this.get<any>(`${API}/gov/india?allowNull=false`).pipe(
        map(res => ({
          updated: res.updated,
          total: this.toTotals(res.total),
          states: (res.states || [])
            .map((s: any) => ({ state: s.state, ...this.toTotals(s) }))
            .filter((s: StateRow) => s.cases > 0)
        })),
        shareReplay(1)
      );
    }
    return this.india$;
  }

  /** Every country, sorted alphabetically. */
  getCountries(force = false): Observable<CountryStats[]> {
    if (!this.countries$ || force) {
      this.countries$ = this.get<any[]>(`${API}/countries?allowNull=false`).pipe(
        map(list => list
          .map(c => ({
            country: c.country,
            flag: c.countryInfo && c.countryInfo.flag,
            updated: c.updated,
            cases: this.num(c.cases),
            todayCases: this.num(c.todayCases),
            deaths: this.num(c.deaths),
            todayDeaths: this.num(c.todayDeaths),
            recovered: this.num(c.recovered),
            active: this.num(c.active),
            population: this.num(c.population)
          }))
          .sort((a, b) => a.country.localeCompare(b.country))),
        shareReplay(1)
      );
    }
    return this.countries$;
  }

  /** Cumulative time series for India since Jan 2020. */
  getIndiaHistory(force = false): Observable<IndiaHistory> {
    if (!this.history$ || force) {
      this.history$ = this.get<any>(`${API}/historical/india?lastdays=all`).pipe(
        map(res => {
          const t = res.timeline || {};
          return {
            cases: this.toSeries(t.cases),
            recovered: this.toSeries(t.recovered),
            deaths: this.toSeries(t.deaths)
          };
        }),
        shareReplay(1)
      );
    }
    return this.history$;
  }

  private get<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(timeout(REQUEST_TIMEOUT_MS), retry(2));
  }

  private toTotals(s: any): Totals {
    s = s || {};
    return {
      cases: this.num(s.cases),
      active: this.num(s.active),
      recovered: this.num(s.recovered),
      deaths: this.num(s.deaths),
      todayCases: this.num(s.todayCases),
      todayActive: this.num(s.todayActive),
      todayRecovered: this.num(s.todayRecovered),
      todayDeaths: this.num(s.todayDeaths)
    };
  }

  /**
   * Converts {"1/22/20": 0, ...} into a sorted series. Sources stopped
   * reporting some metrics (e.g. recovered) at some point and send 0 from then
   * on, so trailing zeros after real data are dropped instead of plotted as a
   * crash to zero.
   */
  private toSeries(obj: { [key: string]: number } | undefined): TimePoint[] {
    if (!obj) { return []; }
    const points = Object.keys(obj).map(key => {
      const [m, d, y] = key.split('/').map(Number);
      return { date: new Date(2000 + y, m - 1, d), value: this.num(obj[key]) };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());

    let peak = 0;
    return points.filter(p => {
      if (peak > 0 && p.value === 0) { return false; }
      peak = Math.max(peak, p.value);
      return true;
    });
  }

  private num(v: any): number {
    const n = Number(v);
    return isFinite(n) ? n : 0;
  }
}
