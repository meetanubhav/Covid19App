import { Component, Input } from '@angular/core';

export interface StatTotals {
  cases: number;
  active: number;
  recovered: number;
  deaths: number;
  todayCases?: number;
  todayActive?: number;
  todayRecovered?: number;
  todayDeaths?: number;
}

interface Card {
  label: string;
  value: number;
  delta?: number;
  tone: string;
}

@Component({
  selector: 'app-stat-cards',
  templateUrl: './stat-cards.component.html',
  styleUrls: ['./stat-cards.component.css']
})
export class StatCardsComponent {
  cards: Card[] = [];

  @Input() set totals(t: StatTotals | null) {
    if (!t) { this.cards = []; return; }
    this.cards = [
      { label: 'Confirmed', value: t.cases, delta: t.todayCases, tone: 'confirmed' },
      { label: 'Active', value: t.active, delta: t.todayActive, tone: 'active' },
      { label: 'Recovered', value: t.recovered, delta: t.todayRecovered, tone: 'recovered' },
      { label: 'Deceased', value: t.deaths, delta: t.todayDeaths, tone: 'deceased' }
    ];
  }

  trackByLabel(_: number, c: Card): string {
    return c.label;
  }
}
