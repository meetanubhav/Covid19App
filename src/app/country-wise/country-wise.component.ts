import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CountryStats, DataService } from '../services/data.service';

@Component({
  selector: 'app-country-wise',
  templateUrl: './country-wise.component.html',
  styleUrls: ['./country-wise.component.css']
})
export class CountryWiseComponent implements OnInit, OnDestroy {

  countries: CountryStats[] = [];
  selectedName = '';
  selected: CountryStats | null = null;
  loading = true;
  error = false;

  private destroy$ = new Subject<void>();

  constructor(private service: DataService) { }

  ngOnInit(): void {
    this.load();
  }

  load(force = false): void {
    this.loading = true;
    this.error = false;
    this.service.getCountries(force)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: list => {
          this.countries = list;
          this.loading = false;
          this.select(this.selectedName);
        },
        error: err => {
          console.error('Failed to load country list', err);
          this.loading = false;
          this.error = true;
        }
      });
  }

  select(name: string): void {
    this.selectedName = name;
    this.selected = this.countries.find(c => c.country === name) || null;
  }

  trackByCountry(_: number, c: CountryStats): string {
    return c.country;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
