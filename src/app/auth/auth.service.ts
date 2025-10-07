import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserInterface } from './types/user.interface';
import { USERS } from '../data/user.data';

export interface SessionUser extends UserInterface {
  expiry: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'saved-users';
  private readonly COOKIE_NAME = 'auth-user';
  private readonly SESSION_DURATION = 1 * 60 * 1000;

  private users: UserInterface[] = [];
  private authStatus = new BehaviorSubject<UserInterface | null>(
    this.getCurrentUser()
  );
  authStatus$ = this.authStatus.asObservable();

  constructor(private router: Router) {
    const savedUsers = localStorage.getItem(this.USERS_KEY);
    this.users = savedUsers ? JSON.parse(savedUsers) : USERS;
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) return false;

    const expiry = Date.now() + this.SESSION_DURATION;
    const sessionUser: SessionUser = { ...user, expiry };
    this.setCookie(this.COOKIE_NAME, JSON.stringify(sessionUser));
    this.authStatus.next(user);

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

  logout(): void {
    this.deleteCookie(this.COOKIE_NAME);
    this.authStatus.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  getCurrentUser(): UserInterface | null {
    const cookie = this.getCookie(this.COOKIE_NAME);
    if (!cookie) return null;

    try {
      const session = JSON.parse(cookie) as SessionUser;
      if (Date.now() > session.expiry) {
        this.logout();
        return null;
      }
      const { expiry, ...user } = session;
      return user;
    } catch {
      return null;
    }
  }

  refreshSession(): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const expiry = Date.now() + this.SESSION_DURATION;
    const sessionUser: SessionUser = { ...user, expiry };
    this.setCookie(this.COOKIE_NAME, JSON.stringify(sessionUser));
    this.authStatus.next(user);
  }

  private setCookie(name: string, value: string) {
    const expiryDate = new Date(Date.now() + this.SESSION_DURATION);
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
