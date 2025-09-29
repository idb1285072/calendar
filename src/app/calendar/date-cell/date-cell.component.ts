import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
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
export class DateCellComponent implements OnChanges {
  @Input() day!: DayCell;
  @Output() clicked = new EventEmitter<Date>();

  showMore = false;
  lineIndices = Array.from({ length: 5 }, (_, i) => i); // [0,1,2,3,4]
  ActivityStatusEnum = ActivityStatusEnum;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['day']) {
      this.showMore = false;
    }
  }

  onClickDateArea() {
    this.clicked.emit(this.day.date);
  }

  isToday(): boolean {
    const t = new Date();
    return (
      this.day.date.getFullYear() === t.getFullYear() &&
      this.day.date.getMonth() === t.getMonth() &&
      this.day.date.getDate() === t.getDate()
    );
  }
}
