import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserInterface } from './types/user.interface';
import { USERS } from '../data/user.data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'saved-users';
  private readonly COOKIE_NAME = 'auth-user';
  private readonly SESSION_DURATION = 30 * 60 * 1000;

  private users: UserInterface[] = [];
  private logoutTimer: any;

  private authStatus = new BehaviorSubject<UserInterface | null>(
    this.getCurrentUser()
  );
  authStatus$ = this.authStatus.asObservable();

  constructor(private router: Router) {
    const savedUsers = localStorage.getItem(this.USERS_KEY);
    this.users = savedUsers ? JSON.parse(savedUsers) : USERS;

    setInterval(() => {
      if (!this.getCookie(this.COOKIE_NAME)) {
        this.authStatus.next(null);
      }
    }, 1000);
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) return false;

    this.setCookie(
      this.COOKIE_NAME,
      JSON.stringify(user),
      this.SESSION_DURATION
    );
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
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));

    return this.login(username, password);
  }

  getCurrentUser(): UserInterface | null {
    const cookie = this.getCookie(this.COOKIE_NAME);
    if (!cookie) return null;
    try {
      return JSON.parse(cookie);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getCookie(this.COOKIE_NAME) !== '';
  }

  logout(): void {
    this.deleteCookie(this.COOKIE_NAME);
    this.authStatus.next(null);

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }

    this.router.navigate(['/login']);
  }

  private startAutoLogout(duration: number) {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.logoutTimer = setTimeout(() => this.logout(), duration);
  }

  private setCookie(name: string, value: string, durationMs: number) {
    const expiryDate = new Date(Date.now() + durationMs);
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }

  private getCookie(name: string): string {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? decodeURIComponent(match[2]) : '';
  }

  private deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  }
}
