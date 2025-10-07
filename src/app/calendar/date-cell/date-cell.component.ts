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

  ngOnInit(): void {
    this.initIsToday();
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
}
