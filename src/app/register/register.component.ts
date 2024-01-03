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
    const registrationData = {
      username: this.username,
      email: this.email,
      password: this.password,
      firstname: this.firstname,
      lastname: this.lastname,
      role: this.role,
      profile_picture: this.profilePicture || ''
    };
    const formData = new FormData();

    if (this.profilePicture) {
      formData.append('profile_picture', this.profilePicture, this.profilePicture.name);
    }
  
    this.authService.register(registrationData,formData).subscribe(
      (response) => {
        if (response && response.message) {
          const registrationMessage = response.message;
          alert(registrationMessage);
        }
      },
      (error) => {
        // Failed registration logic
        const registrationMessage = error.message;
        alert("Registration Failed");
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