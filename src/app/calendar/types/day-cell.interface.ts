import { ActivityInterface } from "./activity.interface";

export interface DayCellInterface {
  date: Date;
  inMonth: boolean;
  lines: (ActivityInterface | null)[];
  hidden: ActivityInterface[];
}