import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService, IndiaSummary, StateRow } from './services/data.service';

type LoadState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  status: LoadState = 'loading';
  errorMessage = '';
  summary: IndiaSummary | null = null;
  stateData: StateRow[] = [];

  readonly tips = [
    { key: 'Stay', rest: 'home when unwell' },
    { key: 'Keep', rest: 'a safe distance' },
    { key: 'Maintain', rest: 'hygiene' },
    { key: 'Wash', rest: 'hands often' },
    { key: 'Cover', rest: 'your cough or sneeze' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private service: DataService) { }

  ngOnInit(): void {
    this.load();
  }

  load(force = false): void {
    this.status = 'loading';
    this.errorMessage = '';
    this.service.getIndia(force)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.summary = data;
          this.stateData = data.states;
          this.status = 'ready';
        },
        error: err => {
          console.error('Failed to load India data', err);
          this.errorMessage = err && err.status
            ? `The data service responded with status ${err.status}.`
            : 'Could not reach the data service. Check your connection and try again.';
          this.status = 'error';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
