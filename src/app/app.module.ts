import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { StudDashboardComponent } from './stud-dashboard/stud-dashboard.component';
import { RegisterComponent } from './register/register.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LabBookingComponent } from './lab-booking/lab-booking.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LabAvailabilityComponent } from './lab-availability/lab-availability.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { BookingHistoryComponent } from './booking-history/booking-history.component';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { EditReservationComponent } from './edit-reservation/edit-reservation.component';
import { NotificationsComponent } from 'src/security/notifications/notifications.component';
import { DashboardComponent } from 'src/security/dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { UpcomingReservationsComponent } from 'src/security/upcoming-reservations/upcoming-reservations.component';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationComponent } from './notification/notification.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    WelcomeComponent,
    StudDashboardComponent,
    RegisterComponent,
    LabBookingComponent,
    LabAvailabilityComponent,
    UserProfileComponent,
    BookingHistoryComponent,
    ConfirmationDialogComponent,
    EditReservationComponent,
    NotificationsComponent,
    DashboardComponent,
    UpcomingReservationsComponent,
    NotificationComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    CommonModule,
    MatMenuModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
