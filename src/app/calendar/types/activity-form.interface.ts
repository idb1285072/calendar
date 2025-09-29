import { FormControl } from '@angular/forms';
import { ActivityStatusEnum } from './enums/activity-status.enum';

export interface ActivityFormInterface {
  title: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  status: FormControl<ActivityStatusEnum>;
}
