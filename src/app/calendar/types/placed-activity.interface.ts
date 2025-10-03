import { ActivityInterface } from "./activity.interface";

export interface PlacedActivityInterface {
  activity: ActivityInterface;
  startIndex: number;
  endIndex: number;
  viewLine: number;
}