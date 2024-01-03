import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// CommonJS


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  

  constructor(private authService: AuthService, private snackBar: MatSnackBar,private router: Router) {}

  onSubmit(): void {
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        // Successful login logic
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: response.message,
        });
        const user_type = response.user_type
        const user_email = response.email
        localStorage.setItem('user_email', user_email.toString());
        if (user_type == "student"){
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/Securitywelcome']);
        }

      },
      (error) => {
        // Failed login logic
        console.error('Login failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'wrong Email or password.',
        });
      }
    );
  }

}
