import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EditReservationComponent } from '../edit-reservation/edit-reservation.component';

@Component({
  selector: 'app-booking-history',
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.css']
})
export class BookingHistoryComponent implements OnInit {
  bookings: any[] | undefined;

  constructor(private authService: AuthService, public dialog: MatDialog, private router: Router) {}

  openConfirmationDialog(booking_id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteBooking(booking_id);
      }
    });
  }

  getUserIDFromSession(): number | null {
    const user_id = JSON.parse(localStorage.getItem('user_id') || 'null');
  
    if (typeof user_id === 'number') {
      return user_id;
    } else {
      return null; 
    }
  }

  ngOnInit(): void {
    const userId = this.getUserIDFromSession();
    if (userId) {
      this.getBookinghistory(userId);
    }
  }

  editBooking(booking_id: number): void {
    if (this.bookings) {
      const bookingToEdit = this.bookings.find(booking => booking.booking_id === booking_id);

      if (bookingToEdit) {
        this.openEditReservationDialog(bookingToEdit);
      }
    }
  }

  openEditReservationDialog(booking: any): void {
    localStorage.setItem('booking', JSON.stringify(booking));

    const dialogRef = this.dialog.open(EditReservationComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle the result if needed
      }
    });
  }

  deleteBooking(booking_id: number): void {
    this.authService.deleteReservation(booking_id).subscribe(
      (data) => {
        alert("Reservation Deleted");
        this.router.navigate([this.router.url]);
      },
      (error) => {
        console.error('Error Deleting Reservation:', error);
        alert("Error Deleting Reservation");
      }
    );
  }

  getBookinghistory(userId: number): void {
    this.authService.getBooking_history(userId).subscribe(
      (data) => {
        this.bookings = data;
      },
      (error) => {
        console.error('Error fetching Reservations:', error);
      }
    );
  }
 

  isBookingEditable(bookingDate: string): boolean {
    const currentDate = new Date();
    const bookingDateValue = new Date(bookingDate);
   
  
    return currentDate <= bookingDateValue;
  }
  
}
