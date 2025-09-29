import { Component, OnInit } from '@angular/core';
import { ActivityInterface } from './types/activity.interface';
import { CalendarService } from './calendar.service';


const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LINES = 5;

interface DayCell {
  date: Date;
  inMonth: boolean;
  // length = MAX_LINES; each item is either ActivityInterface or null
  lines: (ActivityInterface | null)[];
  // hidden activities (overflow) for this day
  hidden: ActivityInterface[];
}

interface PlacedActivity {
  activity: ActivityInterface;
  startIndex: number;
  endIndex: number;
  viewLine: number; // >=0 assigned line index, -1 = overflow
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  today = new Date();
  month = this.today.getMonth();
  year = this.today.getFullYear();

  weeks: DayCell[][] = []; // 6 weeks x 7 days

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.buildCalendar(this.year, this.month);
  }

  private toDateOnly(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private isoToDateOnly(iso: string): Date {
    // iso may contain 'T', take only YYYY-MM-DD
    const datePart = iso.split('T')[0];
    const [y, m, day] = datePart.split('-').map(Number);
    return new Date(y, m - 1, day);
  }

  private dateDiffInDays(a: Date, b: Date) {
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utcB - utcA) / DAY_MS);
  }

  buildCalendar(year: number, month: number) {
    // 1) build 42 day cells (dates)
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: Date[] = [];

    // prev month tail
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    // next month fill to 42
    let nextDay = 1;
    while (days.length < 42) {
      days.push(new Date(year, month + 1, nextDay++));
    }

    // 2) prepare DayCell skeletons
    const dayCells: DayCell[] = days.map((d) => ({
      date: d,
      inMonth: d.getMonth() === month,
      lines: Array.from({ length: MAX_LINES }, () => null),
      hidden: [],
    }));

    // 3) find overlapping activities and compute their startIndex/endIndex relative to grid
    const allActivities = this.calendarService.getActivities();

    const gridStart = this.toDateOnly(dayCells[0].date); // first cell date

    // build list of activities that overlap the grid
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

      // if activity overlaps any grid day (0..41)
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

    // 4) sort events (startIndex asc, then duration desc → longer events earlier helps packing)
    eventsInGrid.sort((x, y) => {
      if (x.startIndex !== y.startIndex) return x.startIndex - y.startIndex;
      const lenX = x.endIndex - x.startIndex;
      const lenY = y.endIndex - y.startIndex;
      return lenY - lenX;
    });

    // 5) assign to lines across whole grid
    const lines: PlacedActivity[][] = []; // each element is a list of placed activities in that line
    const overflow: PlacedActivity[] = [];

    for (const ev of eventsInGrid) {
      let placed = false;
      for (let li = 0; li < lines.length; li++) {
        // check overlaps with any placed event in this line
        const collision = lines[li].some(
          (p) => !(ev.endIndex < p.startIndex || ev.startIndex > p.endIndex)
        );
        if (!collision) {
          // place here
          const placedItem: PlacedActivity = {
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
          // create new line and place
          const newLineIndex = lines.length;
          const placedItem: PlacedActivity = {
            activity: ev.activity,
            startIndex: ev.startIndex,
            endIndex: ev.endIndex,
            viewLine: newLineIndex,
          };
          lines.push([placedItem]);
        } else {
          // overflow: cannot assign a line <= MAX_LINES-1
          const placedItem: PlacedActivity = {
            activity: ev.activity,
            startIndex: ev.startIndex,
            endIndex: ev.endIndex,
            viewLine: -1,
          };
          overflow.push(placedItem);
        }
      }
    }

    // 6) fill dayCells.lines and dayCells.hidden
    // placed lines:
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      for (const placed of lines[lineIndex]) {
        for (let i = placed.startIndex; i <= placed.endIndex; i++) {
          // set that line slot to the activity (same object)
          dayCells[i].lines[lineIndex] = placed.activity;
        }
      }
    }

    // overflow for each day: any overflow activity that spans that day
    for (const ofa of overflow) {
      for (let i = ofa.startIndex; i <= ofa.endIndex; i++) {
        dayCells[i].hidden.push(ofa.activity);
      }
    }

    // 7) chunk into weeks (6 rows of 7)
    this.weeks = [];
    for (let i = 0; i < dayCells.length; i += 7) {
      this.weeks.push(dayCells.slice(i, i + 7));
    }
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
    // parent click handler (optional)
    console.log('date clicked', date);
  }
  get getDate(){
    return new Date(this.year, this.month, 1);
  }
}
