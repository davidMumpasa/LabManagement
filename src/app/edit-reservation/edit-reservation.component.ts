import { Component, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-reservation',
  templateUrl: './edit-reservation.component.html',
  styleUrls: ['./edit-reservation.component.css']
})
export class EditReservationComponent {
  @Input() booking: any;

  constructor(private authService: AuthService,private router: Router) {
    // Retrieve the stored booking data from session or local storage
    const storedBooking =localStorage.getItem('booking');

    if (storedBooking) {
      this.booking = JSON.parse(storedBooking);
    } else {
      // Handle the case where there's no stored data
    }
  }

  onSubmit(updatedData: any) {
    // Check if booking is defined before using it
    const user_id = JSON.parse(localStorage.getItem('user_id') || 'null');
    console.log(this.booking.lab_id)
    if (this.booking) {
      this.authService.updateReservation(
        this.booking.booking_id,
        updatedData.booking_date,
        updatedData.start_time,
        updatedData.end_time,
        updatedData.purpose,
        user_id,
        this.booking.lab_id,
        
      ).subscribe(
        (data) => {
           alert("Reservation updated")
            // Reload the current route to refresh the page
            this.router.navigate([this.router.url]);
        },
        (error) => {
          console.log(error)
          alert("Error updating Reservation")
        }
      );
    } else {
      // Handle the case where booking is undefined
      console.error('Booking data is missing');
      // You may want to display an error message to the user or handle it in your preferred way.
    }
  }
}
