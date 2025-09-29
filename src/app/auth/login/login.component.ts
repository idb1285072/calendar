import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    const success = this.authService.login(this.username, this.password);
    if (success) {
      this.router.navigate(['/add-activity']); 
    } else {
      this.errorMessage = 'Invalid username or password!';
    }
  }
}
