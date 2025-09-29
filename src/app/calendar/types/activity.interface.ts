import { ActivityStatusEnum } from './enums/activity-status.enum';

export interface ActivityInterface {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: ActivityStatusEnum;
  lineIndex?: number;
}
