import { Component, OnInit } from '@angular/core';
import { ActivityInterface } from './types/activity.interface';
import { CalendarService } from './calendar.service';
import { DayCellInterface } from './types/day-cell.interface';
import { PlacedActivityInterface } from './types/placed-activity.interface';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LINES = 5;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  today = new Date();
  month = this.today.getMonth();
  year = this.today.getFullYear();

  weeks: DayCellInterface[][] = [];

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.buildCalendar(this.year, this.month);
  }

  onPrevMonth() {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else this.month--;
    this.buildCalendar(this.year, this.month);
  }

  onNextMonth() {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else this.month++;
    this.buildCalendar(this.year, this.month);
  }

  onGoToday() {
    this.today = new Date();
    this.month = this.today.getMonth();
    this.year = this.today.getFullYear();
    this.buildCalendar(this.year, this.month);
  }

  private toDateOnly(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private isoToDateOnly(iso: string): Date {
    const datePart = iso.split('T')[0];
    const [y, m, day] = datePart.split('-').map(Number);
    return new Date(y, m - 1, day);
  }

  private dateDiffInDays(a: Date, b: Date) {
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utcB - utcA) / DAY_MS);
  }

  private buildCalendar(year: number, month: number) {
    const dayCells = this.createDayCells(year, month);
    const eventsInGrid = this.mapActivitiesToGrid(dayCells);
    const { lines, overflow } = this.placeActivities(eventsInGrid);
    this.fillDayCellsWithActivities(dayCells, lines, overflow);
    this.weeks = this.splitIntoWeeks(dayCells);
  }

  private createDayCells(year: number, month: number): DayCellInterface[] {
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: Date[] = [];

    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    let nextDay = 1;
    while (days.length < 42) {
      days.push(new Date(year, month + 1, nextDay++));
    }

    return days.map((d) => ({
      date: d,
      inMonth: d.getMonth() === month,
      lines: Array.from({ length: MAX_LINES }, () => null),
      hidden: [],
    }));
  }

  private mapActivitiesToGrid(dayCells: DayCellInterface[]) {
    const allActivities = this.calendarService.getActivities();
    const gridStart = this.toDateOnly(dayCells[0].date);

    const eventsInGrid = allActivities
      .map((act) => {
        const startIndex = this.dateDiffInDays(
          gridStart,
          this.isoToDateOnly(act.startDate)
        );
        const endIndex = this.dateDiffInDays(
          gridStart,
          this.isoToDateOnly(act.endDate)
        );
        return { activity: act, startIndex, endIndex };
      })
      .filter((ev) => ev.endIndex >= 0 && ev.startIndex <= 41);

    return eventsInGrid.sort((x, y) => {
      if (x.startIndex !== y.startIndex) return x.startIndex - y.startIndex;
      return y.endIndex - y.startIndex - (x.endIndex - x.startIndex);
    });
  }

  private placeActivities(
    eventsInGrid: {
      activity: ActivityInterface;
      startIndex: number;
      endIndex: number;
    }[]
  ) {
    const lines: PlacedActivityInterface[][] = [];
    const overflow: PlacedActivityInterface[] = [];
    for (const ev of eventsInGrid) {
      let placed = false;
      for (let li = 0; li < lines.length; li++) {
        const collision = lines[li].some(
          (p) => !(ev.endIndex < p.startIndex || ev.startIndex > p.endIndex)
        );
        if (!collision) {
          lines[li].push({ ...ev, viewLine: li });
          placed = true;
          break;
        }
      }
      if (!placed) {
        if (lines.length < MAX_LINES) {
          const newLineIndex = lines.length;
          lines.push([{ ...ev, viewLine: newLineIndex }]);
        } else {
          overflow.push({ ...ev, viewLine: -1 });
        }
      }
    }
    return { lines, overflow };
  }

  private fillDayCellsWithActivities(
    dayCells: DayCellInterface[],
    lines: PlacedActivityInterface[][],
    overflow: PlacedActivityInterface[]
  ) {
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex] || [];
      for (const placed of line) {
        const start = Math.max(0, placed.startIndex);
        const end = Math.min(dayCells.length - 1, placed.endIndex);
        for (let i = start; i <= end; i++) {
          if (dayCells[i]) dayCells[i].lines[lineIndex] = placed.activity;
        }
      }
    }

    for (const overflowActivity of overflow) {
      for (
        let i = overflowActivity.startIndex;
        i <= overflowActivity.endIndex;
        i++
      ) {
        dayCells[i].hidden.push(overflowActivity.activity);
      }
    }
  }

  private splitIntoWeeks(dayCells: DayCellInterface[]): DayCellInterface[][] {
    const weeks: DayCellInterface[][] = [];
    for (let i = 0; i < dayCells.length; i += 7) {
      weeks.push(dayCells.slice(i, i + 7));
    }
    return weeks;
  }

  get getDate() {
    return new Date(this.year, this.month, 1);
  }
}
