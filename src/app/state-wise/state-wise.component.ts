import { Component, Input, OnChanges } from '@angular/core';
import { StateRow } from '../services/data.service';

type SortKey = 'state' | 'cases' | 'active' | 'recovered' | 'deaths';

@Component({
  selector: 'app-state-wise',
  templateUrl: './state-wise.component.html',
  styleUrls: ['./state-wise.component.css']
})
export class StateWiseComponent implements OnChanges {

  @Input() stateData: StateRow[] = [];

  readonly columns: { key: SortKey; label: string; tone?: string }[] = [
    { key: 'state', label: 'State / UT' },
    { key: 'cases', label: 'Confirmed', tone: 'confirmed' },
    { key: 'active', label: 'Active', tone: 'active' },
    { key: 'recovered', label: 'Recovered', tone: 'recovered' },
    { key: 'deaths', label: 'Deceased', tone: 'deceased' }
  ];

  query = '';
  sortKey: SortKey = 'cases';
  sortAsc = false;
  rows: StateRow[] = [];
  maxCases = 1;

  ngOnChanges(): void {
    const data = this.stateData || [];
    this.maxCases = Math.max(1, ...data.map(s => s.cases));
    this.apply();
  }

  sortBy(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = key === 'state';
    }
    this.apply();
  }

  apply(): void {
    const q = this.query.trim().toLowerCase();
    const dir = this.sortAsc ? 1 : -1;
    const key = this.sortKey;
    this.rows = (this.stateData || [])
      .filter(s => !q || s.state.toLowerCase().includes(q))
      .sort((a, b) => key === 'state'
        ? a.state.localeCompare(b.state) * dir
        : ((a[key] as number) - (b[key] as number)) * dir);
  }

  ariaSort(key: SortKey): string {
    if (this.sortKey !== key) { return 'none'; }
    return this.sortAsc ? 'ascending' : 'descending';
  }

  trackByState(_: number, s: StateRow): string {
    return s.state;
  }
}
