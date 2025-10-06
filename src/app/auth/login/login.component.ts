import { Component } from '@angular/core';
import {  Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoginMode = true;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    const success = this.isLoginMode
      ? this.authService.login(this.username, this.password)
      : this.authService.signup(this.username, this.password);

    if (success) {
      this.router.navigate(['/add-activity']);
    } else {
      this.errorMessage = this.isLoginMode
        ? 'Invalid username or password!'
        : 'Username already exists';
    }
  }
  
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }
}
