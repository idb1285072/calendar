// import { Injectable } from '@angular/core';
// import { ActivityInterface } from './types/activity.interface';
// import { ACTIVITY_LIST } from '../data/activity-list.data';

// @Injectable({
//   providedIn: 'root',
// })
// export class CalendarService {
//   private storageKey = 'saved-activities';

//   constructor() {
//     // initialize storage if empty
//     if (!window.localStorage.getItem(this.storageKey)) {
//       this.saveActivityIntoLocalStorage(ACTIVITY_LIST);
//     }
//   }

//   /** Get all activities */
//   getActivities(): ActivityInterface[] {
//     return this.accessActivityFromLocalStorage();
//   }

//   getActivitiesForDay(date: Date): ActivityInterface[] {
//     const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
//     return this.getActivities().filter((a) => {
//       const start = a.startDate.split('T')[0];
//       const end = a.endDate.split('T')[0];
//       return dateKey >= start && dateKey <= end; // activity spans across days
//     });
//   }

//   /** Get activity by id */
//   getActivityById(id: string): ActivityInterface | undefined {
//     return this.getActivities().find((a) => a.id === id);
//   }

//   /** Add new activity */
//   addActivity(activity: ActivityInterface): void {
//     const activities = this.getActivities();
//     activities.push(activity);
//     this.saveActivityIntoLocalStorage(activities);
//   }

//   /** Update activity */
//   updateActivity(updated: ActivityInterface): void {
//     let activities = this.getActivities();
//     activities = activities.map((a) => (a.id === updated.id ? updated : a));
//     this.saveActivityIntoLocalStorage(activities);
//   }

//   /** Delete activity by id */
//   deleteActivity(id: string): void {
//     let activities = this.getActivities();
//     activities = activities.filter((a) => a.id !== id);
//     this.saveActivityIntoLocalStorage(activities);
//   }

//   // -------------------------------
//   // LocalStorage private helpers
//   // -------------------------------
//   private saveActivityIntoLocalStorage(activities: ActivityInterface[]) {
//     window.localStorage.setItem(this.storageKey, JSON.stringify(activities));
//   }

//   private accessActivityFromLocalStorage(): ActivityInterface[] {
//     const savedActivities = window.localStorage.getItem(this.storageKey);
//     return savedActivities ? JSON.parse(savedActivities) : [];
//   }

//   private assignLines(activities: ActivityInterface[]): ActivityInterface[] {
//     const lines: ActivityInterface[][] = [[], [], [], [], []]; // 5 lines max

//     activities.forEach((activity) => {
//       // find a free line
//       let placed = false;
//       for (let i = 0; i < lines.length; i++) {
//         if (!lines[i].some((a) => this.overlaps(a, activity))) {
//           activity.lineIndex = i;
//           lines[i].push(activity);
//           placed = true;
//           break;
//         }
//       }
//       if (!placed) {
//         activity.lineIndex = -1; // goes to "more"
//       }
//     });

//     return activities;
//   }

//   private overlaps(a: ActivityInterface, b: ActivityInterface): boolean {
//     const aStart = new Date(a.startDate).getTime();
//     const aEnd = new Date(a.endDate).getTime();
//     const bStart = new Date(b.startDate).getTime();
//     const bEnd = new Date(b.endDate).getTime();
//     return !(bEnd < aStart || bStart > aEnd);
//   }
// }

import { Injectable } from '@angular/core';
import { ActivityInterface } from './types/activity.interface';
import { ACTIVITY_LIST } from '../data/activity-list.data';


@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private storageKey = 'saved-activities';

  constructor() {
    if (!window.localStorage.getItem(this.storageKey)) {
      this.saveActivityIntoLocalStorage(ACTIVITY_LIST || []);
    }
  }

  getActivities(): ActivityInterface[] {
    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as ActivityInterface[];
    } catch {
      return [];
    }
  }

  getActivityById(id: string): ActivityInterface | undefined {
    return this.getActivities().find((a) => a.id === id);
  }

  addActivity(activity: ActivityInterface): void {
    const list = this.getActivities();
    list.push(activity);
    this.saveActivityIntoLocalStorage(list);
  }

  updateActivity(updated: ActivityInterface): void {
    const list = this.getActivities().map((a) =>
      a.id === updated.id ? updated : a
    );
    this.saveActivityIntoLocalStorage(list);
  }

  deleteActivity(id: string): void {
    const list = this.getActivities().filter((a) => a.id !== id);
    this.saveActivityIntoLocalStorage(list);
  }

  private saveActivityIntoLocalStorage(list: ActivityInterface[]) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(list));
  }
}
