import { AbstractControl, ValidationErrors } from '@angular/forms';

export function endDateAfterStartDate(
  control: AbstractControl
): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  return end >= start ? null : { endBeforeStart: true };
}
