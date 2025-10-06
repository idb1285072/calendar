import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivityInterface } from '../types/activity.interface';
import { ActivityStatusEnum } from '../types/enums/activity-status.enum';

interface DayCell {
  date: Date;
  inMonth: boolean;
  lines: (ActivityInterface | null)[];
  hidden: ActivityInterface[];
}

@Component({
  selector: 'app-date-cell',
  templateUrl: './date-cell.component.html',
  styleUrls: ['./date-cell.component.css'],
})
export class DateCellComponent implements OnInit {
  @Input() day!: DayCell;
  isToday: boolean = false;
  showMore = false;
  ActivityStatusEnum = ActivityStatusEnum;

  ngOnInit(): void {
    this.initIsToday();
  }

  private initIsToday() {
    const t = new Date();
    this.isToday =
      this.day.date.getFullYear() === t.getFullYear() &&
      this.day.date.getMonth() === t.getMonth() &&
      this.day.date.getDate() === t.getDate();
  }
}
