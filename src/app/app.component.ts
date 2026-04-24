import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from './services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DailyData {
  dailyconfirmed: number;
  dailyrecovered: number;
  dailydeceased: number;
}

interface StateData {
  active: number;
  confirmed: number;
  recovered: number;
  deaths: number;
}

interface CovidResponse {
  statewise: StateData[];
  cases_time_series: DailyData[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {

  private fullResponse: CovidResponse | null = null;
  private destroy$ = new Subject<void>();

  // National aggregate data
  totalActive: number = 0;
  totalConfirm: number = 0;
  totalRecovered: number = 0;
  totalDeaths: number = 0;

  // Daily stats
  dailyConfirmed: number = 0;
  dailyRecovered: number = 0;
  dailyDeaths: number = 0;

  // State-wise data
  stateData: StateData[] = [];

  // Status flags
  serverResponse: boolean = false;
  errorMessage: string = '';

  constructor(private service: DataService) { }

  ngOnInit() {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        response => this.handleDataSuccess(response),
        error => this.handleDataError(error)
      );
  }

  private handleDataSuccess(response: CovidResponse): void {
    try {
      this.fullResponse = response;
      this.stateData = response.statewise;

      // Extract national aggregate data from first statewise entry
      const nationalData = response.statewise[0];
      this.totalActive = this.parseNumber(nationalData.active);
      this.totalConfirm = this.parseNumber(nationalData.confirmed);
      this.totalRecovered = this.parseNumber(nationalData.recovered);
      this.totalDeaths = this.parseNumber(nationalData.deaths);

      // Extract latest daily data
      if (response.cases_time_series && response.cases_time_series.length > 0) {
        const latestDaily = response.cases_time_series[response.cases_time_series.length - 1];
        this.dailyConfirmed = this.parseNumber(latestDaily.dailyconfirmed);
        this.dailyRecovered = this.parseNumber(latestDaily.dailyrecovered);
        this.dailyDeaths = this.parseNumber(latestDaily.dailydeceased);
      }

      this.serverResponse = true;
      this.errorMessage = '';
    } catch (error) {
      this.handleDataError(error);
    }
  }

  private handleDataError(error: any): void {
    this.serverResponse = false;
    this.errorMessage = `Error loading data: ${error?.status || 'Unknown error'}`;
    console.error('Data loading error:', error);
  }

  private parseNumber(value: any): number {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  currentDT: number = Date.now();
}