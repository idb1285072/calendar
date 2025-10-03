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

  prevMonth() {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else this.month--;
    this.buildCalendar(this.year, this.month);
  }

  nextMonth() {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else this.month++;
    this.buildCalendar(this.year, this.month);
  }

  goToday() {
    this.today = new Date();
    this.month = this.today.getMonth();
    this.year = this.today.getFullYear();
    this.buildCalendar(this.year, this.month);
  }

  onDateClick(date: Date) {
    console.log('date clicked', date);
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

    const dayCells: DayCellInterface[] = days.map((d) => ({
      date: d,
      inMonth: d.getMonth() === month,
      lines: Array.from({ length: MAX_LINES }, () => null),
      hidden: [],
    }));

    const allActivities = this.calendarService.getActivities();

    const gridStart = this.toDateOnly(dayCells[0].date);

    const eventsInGrid: {
      activity: ActivityInterface;
      startIndex: number;
      endIndex: number;
    }[] = [];

    for (const act of allActivities) {
      const aStart = this.isoToDateOnly(act.startDate);
      const aEnd = this.isoToDateOnly(act.endDate);

      const startIndex = this.dateDiffInDays(gridStart, aStart);
      const endIndex = this.dateDiffInDays(gridStart, aEnd);

      if (endIndex >= 0 && startIndex <= 41) {
        const clampedStart = Math.max(0, startIndex);
        const clampedEnd = Math.min(41, endIndex);
        eventsInGrid.push({
          activity: act,
          startIndex: clampedStart,
          endIndex: clampedEnd,
        });
      }
    }

    eventsInGrid.sort((x, y) => {
      if (x.startIndex !== y.startIndex) return x.startIndex - y.startIndex;
      const lenX = x.endIndex - x.startIndex;
      const lenY = y.endIndex - y.startIndex;
      return lenY - lenX;
    });

    const lines: PlacedActivityInterface[][] = [];
    const overflow: PlacedActivityInterface[] = [];

    for (const ev of eventsInGrid) {
      let placed = false;
      for (let li = 0; li < lines.length; li++) {
        const collision = lines[li].some(
          (p) => !(ev.endIndex < p.startIndex || ev.startIndex > p.endIndex)
        );
        if (!collision) {
          const placedItem: PlacedActivityInterface = {
            activity: ev.activity,
            startIndex: ev.startIndex,
            endIndex: ev.endIndex,
            viewLine: li,
          };
          lines[li].push(placedItem);
          placed = true;
          break;
        }
      }

      if (!placed) {
        if (lines.length < MAX_LINES) {
          const newLineIndex = lines.length;
          const placedItem: PlacedActivityInterface = {
            activity: ev.activity,
            startIndex: ev.startIndex,
            endIndex: ev.endIndex,
            viewLine: newLineIndex,
          };
          lines.push([placedItem]);
        } else {
          const placedItem: PlacedActivityInterface = {
            activity: ev.activity,
            startIndex: ev.startIndex,
            endIndex: ev.endIndex,
            viewLine: -1,
          };
          overflow.push(placedItem);
        }
      }
    }

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      for (const placed of lines[lineIndex]) {
        for (let i = placed.startIndex; i <= placed.endIndex; i++) {
          dayCells[i].lines[lineIndex] = placed.activity;
        }
      }
    }

    for (const ofa of overflow) {
      for (let i = ofa.startIndex; i <= ofa.endIndex; i++) {
        dayCells[i].hidden.push(ofa.activity);
      }
    }

    this.weeks = [];
    for (let i = 0; i < dayCells.length; i += 7) {
      this.weeks.push(dayCells.slice(i, i + 7));
    }
  }

  get getDate() {
    return new Date(this.year, this.month, 1);
  }
}
