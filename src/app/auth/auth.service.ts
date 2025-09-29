import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserInterface } from './types/user.interface';
import { USERS } from '../data/user.data';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user';
  private readonly EXPIRY_KEY = 'auth_expiry';
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  private authStatus = new BehaviorSubject<UserInterface | null>(
    this.getCurrentUser()
  );
  authStatus$ = this.authStatus.asObservable();

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    const user = USERS.find(
      (u: UserInterface) => u.username === username && u.password === password
    );

    if (user) {
      const expiry = new Date().getTime() + this.SESSION_DURATION;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(this.EXPIRY_KEY, expiry.toString());
      this.authStatus.next(user); // 🔥 notify
      return true;
    }
    return false;
  }

  getCurrentUser(): UserInterface | null {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);

    if (expiry && new Date().getTime() > +expiry) {
      this.logout(); // expired
      return null;
    }

    const userData = localStorage.getItem(this.STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    this.authStatus.next(null); // 🔥 notify
    this.router.navigate(['/login']);
  }
}
