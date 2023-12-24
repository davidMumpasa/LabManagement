import { Component, OnInit} from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stud-dashboard',
  templateUrl: './stud-dashboard.component.html',
  styleUrls: ['./stud-dashboard.component.css']
})
export class StudDashboardComponent implements OnInit{
  labs: any[] = [];
  searchTerm = '';
  filteredLabs: any[] = [];
  isAuthenticated: boolean = false;
  notifications: any[] = [];
  selectedNotification: any;
  
  // Method to handle notification click
  showNotificationDetails(notification: any): void {
    this.selectedNotification = notification;
  }

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchLabs();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.fetchNotifications();
  }
  
  // Method to fetch labs from the API
  fetchLabs(): void {
    this.authService.getLabs().subscribe(
      (data) => {
        // Check if the data is an array of labs
        if (Array.isArray(data)) {
          // Update the labs data
          this.labs = data;
          this.filteredLabs = data; // Initialize filteredLabs with all labs
  
          // Extract and store user_id in localStorage
          const userObject = data.find((lab) => lab.user_id !== undefined);
          if (userObject && userObject.user_id) {
            localStorage.setItem('user_id', JSON.stringify(userObject.user_id));
            console.log(userObject.user_id)
          }
        } else {
          console.error('Invalid response from getLabs:', data);
          // Handle the case where the response is invalid
        }
      },
      (error) => {
        console.error('Error fetching labs:', error);
      }
    );
  }

  fetchNotifications(): void {
    this.authService.getNotificationsFromBackend().subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.notifications = data;
        } else {
          console.error('Invalid response from getNotificationsFromBackend:', data);
        }
      },
      (error) => {
        console.error('Error fetching notifications:', error);
      }
    );
  }

  
  filterLabs(): void {
    if (!this.searchTerm) {
      this.filteredLabs = this.labs;
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredLabs = this.labs.filter((lab) =>
      lab.lab_name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout().subscribe(
      () => {
        this.authService.logout(); 
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error logging out:', error);
      }
    );
  }

  // Inside your component class
  getLab(labId: number): void {
  // You can now use the labId in your service method
  this.authService.getLab(labId).subscribe(
      (response) => {
        this.router.navigate(['/booklab', labId]);
      },
      (error) => {
           
      }
  );
}

getStatusInfo(status: string): { text: string; color: string } {
  switch (status) {
    case 'null':
      return { text: 'Pending', color: 'green' };
    case 'opened':
      return { text: 'Beating', color: 'green' };
    // Add more cases for other statuses if needed
    default:
      return { text: 'Unknown', color: 'gray' };
  }
}

}
