import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-stud-dashboard',
  templateUrl: './stud-dashboard.component.html',
  styleUrls: ['./stud-dashboard.component.css']
})
export class StudDashboardComponent implements OnInit, OnDestroy {
  labs: any[] = [];
  searchTerm = '';
  filteredLabs: any[] = [];
  isAuthenticated: boolean = false;
  notifications: any[] = [];
  selectedNotification: any;
  reminders: any[] = [];
  private reminderInterval: any;

  // Method to handle notification click
  showNotificationDetails(notification: any): void {
    this.selectedNotification = notification;
  }

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchLabs();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.fetchNotifications();
    // this.getReminder();

    // Set up a recurring interval to check for reminders every minute
    this.reminderInterval = setInterval(() => {
      this.getReminder();
    }, 60000); // 60000 milliseconds = 1 minute
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    clearInterval(this.reminderInterval);
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
            console.log(userObject.user_id);
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
    const userId = localStorage.getItem('user_id');
    // Check if userId is not null
    if (userId !== null) {
      const user_id = parseInt(userId, 10);
      this.authService.getNotificationsFromBackend(user_id).subscribe(
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
  }
  

  // Method to handle confirmation of booking
  confirmBooking(booking: any, userId: number, confirmationStatus: string): void {
    this.authService.confirmBooking(userId, booking.booking_id, confirmationStatus)
      .subscribe(
        (response) => {
          console.log('Booking confirmed', response);
        },
        (error) => {
          console.error('Error confirming booking', error);
        }
      );
  }

  getReminder(): void {
    const userId = localStorage.getItem('user_id');
  
    // Check if userId is not null
    if (userId !== null) {
      const user_id = parseInt(userId, 10);
      const user_email = localStorage.getItem('user_email');
  
      if (user_email !== null) {
        this.authService.getBooking_history(user_id,user_email).subscribe(
          (data) => {
            if (Array.isArray(data)) {
              this.reminders = data;
    
              // Iterate through bookings
              for (const booking of data) {
                // Get the booking time as a Date object
                const bookingTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    
                // Calculate the time difference
                const timeDifference = bookingTime.getTime() - Date.now();
    
                // If the booking is within the next 2 minutes, display a SweetAlert2 confirmation dialog
                if (timeDifference <= 2 * 60 * 1000 && timeDifference > 0) {
                  Swal.fire({
                    title: 'Reminder',
                    text: `Booking for ${booking.lab_name} ${booking.booking_date} at ${booking.start_time} is in 2 minutes.`,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Decline'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // User clicked "Confirm"
                      this.confirmBooking(booking, user_id, 'yes');
                      console.log('Reminder confirmed');
                    } else if (result.isDismissed) {
                      // User clicked "Decline" or closed the dialog
                      // Add your logic here for declined reminder
                      this.confirmBooking(booking, user_id, 'no');
                      console.log('Reminder declined');
                    }
                  });
                }
              }
            } else {
              console.error('Invalid response from getBooking_history:', data);
            }
          },
          (error) => {
            console.error('Error fetching booking history:', error);
          }
        );
      }
      
    } else {
      console.error('User ID not found in localStorage');
    }
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
