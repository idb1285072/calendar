import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivityInterface } from '../types/activity.interface';
import { ActivityStatusEnum } from '../types/enums/activity-status.enum';

@Component({
  selector: 'app-activities-modal',
  templateUrl: './activities-modal.component.html',
  styleUrls: ['./activities-modal.component.css'],
})
export class ActivitiesModalComponent {
  @Input() activities: ActivityInterface[] = [];
  @Input() date!: Date;
  @Output() close = new EventEmitter<void>();

  ActivityStatusEnum = ActivityStatusEnum;

  onClose() {
    this.close.emit();
  }
}
