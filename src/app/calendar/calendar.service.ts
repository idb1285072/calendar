import { Injectable } from '@angular/core';
import { ActivityInterface } from './types/activity.interface';
import { ACTIVITY_LIST } from '../data/activity-list.data';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private storageKey = 'saved-activities';

  constructor() {
    this.initActivity();
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

  addActivity(activity: ActivityInterface): void {
    const list = this.getActivities();
    list.push(activity);
    this.saveActivityIntoLocalStorage(list);
  }

  getActivityById(id: string): ActivityInterface | undefined {
    return this.getActivities().find((a) => a.id === id);
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

  private initActivity() {
    if (!window.localStorage.getItem(this.storageKey)) {
      this.saveActivityIntoLocalStorage(ACTIVITY_LIST || []);
    }
  }
}
