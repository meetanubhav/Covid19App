import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService, IndiaHistory, TimePoint } from '../services/data.service';

type Metric = 'cases' | 'recovered' | 'deaths';
type Mode = 'total' | 'daily';

interface Tick { pos: number; label: string; }

/**
 * Lightweight, dependency-free SVG chart. Replaces the CanvasJS + jQuery
 * version, which fetched a dead URL outside Angular and never re-rendered.
 * The SVG uses a viewBox, so it scales to any screen width.
 */
@Component({
  selector: 'app-chart-js',
  templateUrl: './chart-js.component.html',
  styleUrls: ['./chart-js.component.css']
})
export class ChartJsComponent implements OnInit, OnDestroy {

  readonly W = 800;
  readonly H = 300;
  readonly pad = { top: 4, right: 0, bottom: 0, left: 0 };

  readonly metrics: { key: Metric; label: string }[] = [
    { key: 'cases', label: 'Confirmed' },
    { key: 'recovered', label: 'Recovered' },
    { key: 'deaths', label: 'Deceased' }
  ];

  metric: Metric = 'cases';
  mode: Mode = 'daily';
  loading = true;
  error = false;

  linePath = '';
  areaPath = '';
  xTicks: Tick[] = [];
  yTicks: Tick[] = [];
  rangeLabel = '';
  hover: { x: number; y: number; point: TimePoint; left: number } | null = null;

  private history: IndiaHistory | null = null;
  private points: TimePoint[] = [];
  private xs: number[] = [];
  private ys: number[] = [];
  private destroy$ = new Subject<void>();

  constructor(private service: DataService) { }

  ngOnInit(): void {
    this.load();
  }

  load(force = false): void {
    this.loading = true;
    this.error = false;
    this.service.getIndiaHistory(force)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: h => {
          this.history = h;
          this.loading = false;
          this.render();
        },
        error: err => {
          console.error('Failed to load history', err);
          this.loading = false;
          this.error = true;
        }
      });
  }

  setMetric(m: Metric): void {
    this.metric = m;
    this.render();
  }

  setMode(m: Mode): void {
    this.mode = m;
    this.render();
  }

  get plotW(): number { return this.W - this.pad.left - this.pad.right; }
  get plotH(): number { return this.H - this.pad.top - this.pad.bottom; }

  private render(): void {
    this.hover = null;
    const series = this.history ? this.history[this.metric] : [];
    this.points = this.mode === 'daily' ? this.toDaily(series) : series;
    const pts = this.points;
    if (pts.length < 2) {
      this.linePath = this.areaPath = '';
      this.xTicks = this.yTicks = [];
      this.rangeLabel = '';
      return;
    }

    const t0 = pts[0].date.getTime();
    const t1 = pts[pts.length - 1].date.getTime();
    const maxV = this.niceMax(Math.max(...pts.map(p => p.value)));
    const x = (t: number) => this.pad.left + ((t - t0) / (t1 - t0 || 1)) * this.plotW;
    const y = (v: number) => this.pad.top + this.plotH - (v / maxV) * this.plotH;

    this.xs = pts.map(p => x(p.date.getTime()));
    this.ys = pts.map(p => y(p.value));

    let d = '';
    for (let i = 0; i < pts.length; i++) {
      d += (i ? 'L' : 'M') + this.xs[i].toFixed(1) + ',' + this.ys[i].toFixed(1);
    }
    this.linePath = d;
    const base = (this.pad.top + this.plotH).toFixed(1);
    this.areaPath = `${d}L${this.xs[pts.length - 1].toFixed(1)},${base}L${this.xs[0].toFixed(1)},${base}Z`;

    this.yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ pos: y(maxV * f), label: this.compact(maxV * f) }));

    this.xTicks = [];
    const startYear = pts[0].date.getFullYear();
    const endYear = pts[pts.length - 1].date.getFullYear();
    for (let yr = startYear; yr <= endYear; yr++) {
      for (const m of [0, 6]) {
        const t = new Date(yr, m, 1).getTime();
        if (t >= t0 && t <= t1) {
          this.xTicks.push({ pos: x(t), label: (m ? 'Jul ' : 'Jan ') + String(yr).slice(2) });
        }
      }
    }

    const fmt = (dt: Date) => dt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    this.rangeLabel = `${fmt(pts[0].date)} – ${fmt(pts[pts.length - 1].date)}`;
  }

  onMove(evt: MouseEvent | TouchEvent, svg: SVGSVGElement): void {
    if (!this.points.length) { return; }
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in evt ? (evt.touches[0] ? evt.touches[0].clientX : 0) : evt.clientX;
    const vx = ((clientX - rect.left) / rect.width) * this.W;
    // binary search nearest x
    let lo = 0;
    let hi = this.xs.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.xs[mid] < vx) { lo = mid; } else { hi = mid; }
    }
    const i = Math.abs(this.xs[lo] - vx) < Math.abs(this.xs[hi] - vx) ? lo : hi;
    this.hover = {
      x: this.xs[i],
      y: this.ys[i],
      point: this.points[i],
      left: Math.min(Math.max((this.xs[i] / this.W) * 100, 12), 88)
    };
  }

  clearHover(): void {
    this.hover = null;
  }

  /** Cumulative → 7-day average of new values (smooths reporting spikes). */
  private toDaily(series: TimePoint[]): TimePoint[] {
    const daily = series.map((p, i) => ({
      date: p.date,
      value: i ? Math.max(0, p.value - series[i - 1].value) : 0
    }));
    const out: TimePoint[] = [];
    let sum = 0;
    for (let i = 0; i < daily.length; i++) {
      sum += daily[i].value;
      if (i >= 7) { sum -= daily[i - 7].value; }
      out.push({ date: daily[i].date, value: Math.round(sum / Math.min(i + 1, 7)) });
    }
    return out;
  }

  private niceMax(v: number): number {
    if (v <= 0) { return 1; }
    const mag = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / mag;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * mag;
  }

  private compact(v: number): string {
    if (v >= 1e7) { return +(v / 1e7).toFixed(1) + ' Cr'; }
    if (v >= 1e5) { return +(v / 1e5).toFixed(1) + ' L'; }
    if (v >= 1e3) { return +(v / 1e3).toFixed(1) + 'K'; }
    return String(Math.round(v));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
