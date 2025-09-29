import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivityFormInterface } from '../types/activity-form.interface';
import { ActivityStatusEnum } from '../types/enums/activity-status.enum';
import { __values } from 'tslib';
import { CalendarService } from '../calendar.service';
import { ActivityInterface } from '../types/activity.interface';
import { endDateAfterStartDate } from 'src/app/shared/validation/end-date-after-start-date.validation';

@Component({
  selector: 'app-add-activity',
  templateUrl: './add-activity.component.html',
  styleUrls: ['./add-activity.component.css'],
})
export class AddActivityComponent implements OnInit {
  activityForm!: FormGroup<ActivityFormInterface>;
  statusOptions = [
    {
      label: 'Pending',
      value: ActivityStatusEnum.Pending,
    },
    {
      label: 'OnGoing',
      value: ActivityStatusEnum.OnGoing,
    },
    {
      label: 'Complete',
      value: ActivityStatusEnum.Complete,
    },
  ];

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.initActivityForm();
  }
  onSubmit() {
    if (this.activityForm.invalid) return;

    const formValue = this.activityForm.value;

    // create ActivityInterface object
    const newActivity: ActivityInterface = {
      id: Date.now().toString(),
      title: formValue.title as string,
      startDate: new Date(formValue.startDate as string).toISOString(),
      endDate: new Date(formValue.endDate as string).toISOString(),
      status: formValue.status as ActivityStatusEnum,
    };

    this.calendarService.addActivity(newActivity);

    // Reset form (keep default status)
    this.activityForm.reset({
      title: '',
      startDate: '',
      endDate: '',
      status: ActivityStatusEnum.Pending,
    });

    alert('Activity added successfully!');
  }

  private initActivityForm() {
    this.activityForm = new FormGroup(
      {
        title: new FormControl<string>('', {
          nonNullable: true,
          validators: Validators.required,
        }),
        startDate: new FormControl<string>('', {
          nonNullable: true,
          validators: Validators.required,
        }),
        endDate: new FormControl<string>('', {
          nonNullable: true,
          validators: Validators.required,
        }),
        status: new FormControl<ActivityStatusEnum>(
          ActivityStatusEnum.Pending,
          {
            nonNullable: true,
            validators: Validators.required,
          }
        ),
      },
      { validators: endDateAfterStartDate }
    );
  }
}
