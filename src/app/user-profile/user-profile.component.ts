// user-profile.component.ts

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userProfile: any = {};
  isEditing: boolean = false;
  newProfilePicture: File | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.getUserIDFromSession();
    if (userId !== null) {
      this.fetchUserProfile(userId);
    } else {
      console.error('User ID not found in session.');
    }
  }
  
  
  getUserIDFromSession(): number | null {
    const user_id = JSON.parse(localStorage.getItem('user_id') || 'null');
  
    if (typeof user_id === 'number') {
      return user_id;
    } else {
      return null; // Handle the case where user_id is not a number or is null
    }
  }
  
  

  fetchUserProfile(userId: number): void {
    this.authService.getUserProfile(userId).subscribe(
      (data) => {
        console.log("----------------------------------------")
        console.log("Picture: ",data.profile_picture)
        this.userProfile = data;
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      }
    );
  }

  editProfile(): void {
    this.isEditing = true;
  }

  saveProfile(): void {
    const formData = new FormData();

    formData.append('user_id',this.userProfile.id);
    formData.append('username', this.userProfile.username);
    formData.append('email', this.userProfile.email);
    formData.append('firstname', this.userProfile.first_name);
    formData.append('lastname', this.userProfile.last_name);
    formData.append('password', this.userProfile.password);
    formData.append('profile_picture', this.userProfile.profile_picture || '');

    this.authService.editUserProfile(formData).subscribe(
      () => {
        this.isEditing = false;
        this.fetchUserProfile(this.userProfile.id);
        alert("Profile Edited");
      },
      (error) => {
        alert("Error updating user profile");
      }
    );
  }
  

  onProfilePictureChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.newProfilePicture = files[0];
    } else {
      this.newProfilePicture = null;
    }
  }

  uploadProfilePicture(): void {
    // Trigger the file input click event
    const fileInput = document.getElementById('profilePicture');
    if (fileInput) {
      fileInput.click();
    }
  }
  
  getUserProfilePicture(): string {
    if (this.userProfile && this.userProfile.profile_picture) {
      // Construct the full path to the profile picture
      const profilePicturePath = `assets/images/profile/${this.userProfile.profile_picture}`;
      
      // If the image exists, return its path; otherwise, return a placeholder image
      return profilePicturePath; 
    } else {
      return 'assets/images/placeholder.png';
    }
  }
  
}
 

