import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';
  firstname = '';
  lastname = '';
  role = '';
  profilePicture: File | null = null;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('firstname', this.firstname);
    formData.append('lastname', this.lastname);
    formData.append('role', this.role);
    formData.append('profile_picture', this.profilePicture|| '');
  
    this.authService.register(formData).subscribe(
      (response) => {
        if (response && response.message) {
          const registrationMessage = response.message;
          alert("registration successfull")
          console.log('Registration Message:', registrationMessage);
        }
      },
      (error) => {
        // Failed registration logic
        const registrationMessage = error.message;
        alert("registration Failed")
        console.log('Registration Message:', registrationMessage);
      }
    );
  }
  

  onProfilePictureChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.profilePicture = files[0];
    } else {
      this.profilePicture = null;
    }
  }
}