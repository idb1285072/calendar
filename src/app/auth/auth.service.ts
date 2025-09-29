import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserInterface } from './types/user.interface';
import { USERS } from '../data/user.data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth-user';
  private readonly EXPIRY_KEY = 'auth-expiry';
  private readonly USERS_KEY = 'saved-users';
  private readonly SESSION_DURATION = 1 * 60 * 1000;

  private users: UserInterface[] = [];
  private logoutTimer: any;

  private authStatus = new BehaviorSubject<UserInterface | null>(
    this.getCurrentUser()
  );
  authStatus$ = this.authStatus.asObservable();

  constructor(private router: Router) {
    const savedUsers = localStorage.getItem(this.USERS_KEY);
    if (savedUsers) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(savedUsers));
    }
    this.users = savedUsers ? JSON.parse(savedUsers) : USERS;

    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY && !event.newValue) {
        this.authStatus.next(null);
        if (this.logoutTimer) clearTimeout(this.logoutTimer);
      }
    });
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) return false;

    const expiry = Date.now() + this.SESSION_DURATION;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.EXPIRY_KEY, expiry.toString());
    this.authStatus.next(user);

    this.startAutoLogout(this.SESSION_DURATION);
    return true;
  }

  signup(username: string, password: string): boolean {
    const exists = this.users.some((u) => u.username === username);
    if (exists) return false;

    const newUser: UserInterface = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      username,
      password,
    };

    this.users.push(newUser);
    this.saveUsers();

    return this.login(username, password);
  }

  getCurrentUser(): UserInterface | null {
    const expiryStr = localStorage.getItem(this.EXPIRY_KEY);
    const userStr = localStorage.getItem(this.STORAGE_KEY);

    if (!expiryStr || !userStr) return null;

    const expiry = +expiryStr;
    const remaining = expiry - Date.now();

    if (remaining <= 0) {
      this.logout();
      return null;
    }

    this.startAutoLogout(remaining);

    return JSON.parse(userStr);
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    this.authStatus.next(null);

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }

    this.router.navigate(['/login']);
  }

  private saveUsers(): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
  }

  private startAutoLogout(duration: number) {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.logoutTimer = setTimeout(() => this.logout(), duration);
  }
}
