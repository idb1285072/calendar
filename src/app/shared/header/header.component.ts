import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  username: string | null = null;

  private distroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.initAuthData();
  }

  onLogout() {
    this.authService.logout();
  }

  private initAuthData() {
    this.authService.authStatus$
      .pipe(takeUntil(this.distroy$))
      .subscribe((user) => {
        this.isAuthenticated = !!user;
        this.username = user?.username ?? null;
      });
  }

  ngOnDestroy(): void {
    this.distroy$.next();
    this.distroy$.complete();
  }
}
