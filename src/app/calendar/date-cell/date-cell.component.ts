import { Component, Input, OnInit } from '@angular/core';
import { ActivityStatusEnum } from '../types/enums/activity-status.enum';
import { DayCellInterface } from '../types/day-cell.interface';

@Component({
  selector: 'app-date-cell',
  templateUrl: './date-cell.component.html',
  styleUrls: ['./date-cell.component.css'],
})
export class DateCellComponent implements OnInit {
  @Input() day!: DayCellInterface;
  isToday: boolean = false;
  showModal = false;
  ActivityStatusEnum = ActivityStatusEnum;
  showTitleFlags: boolean[] = [];

  ngOnInit(): void {
    this.initIsToday();
    this.computeShowTitleFlags();
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  private initIsToday() {
    const t = new Date();
    this.isToday =
      this.day.date.getFullYear() === t.getFullYear() &&
      this.day.date.getMonth() === t.getMonth() &&
      this.day.date.getDate() === t.getDate();
  }

  private computeShowTitleFlags() {
    this.showTitleFlags = this.day.lines.map((activity) => {
      if (!activity) return false;
      const start = new Date(activity.startDate);
      const dayDate = this.day.date;
      return (
        start.getFullYear() === dayDate.getFullYear() &&
        start.getMonth() === dayDate.getMonth() &&
        start.getDate() === dayDate.getDate()
      );
    });
  }
}
