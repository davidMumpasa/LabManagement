import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-upcoming-reservations',
  templateUrl: './upcoming-reservations.component.html',
  styleUrls: ['./upcoming-reservations.component.css'],
})
export class UpcomingReservationsComponent implements OnInit {
  reservations: any[] = [];
  showUpcomingReservations: boolean = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations() {
    this.authService.getReservations().subscribe(
      (reservations) => {
        // Filter reservations based on the view
        if (this.showUpcomingReservations) {
          // Only show upcoming reservations
          this.reservations = reservations.filter(
            (reservation) => new Date(reservation.booking_date) >= new Date()
          );
        } else {
          // Show all reservations
          this.reservations = reservations;
        }
      },
      (error) => {
        console.error('Error loading reservations:', error);
      }
    );
  }

  toggleReservations() {
    this.showUpcomingReservations = !this.showUpcomingReservations;
    // Reload reservations based on the selected view
    this.loadReservations();
  }
}
