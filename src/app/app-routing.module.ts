import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { RegisterComponent } from './register/register.component';  
import { StudDashboardComponent } from './stud-dashboard/stud-dashboard.component';
import { LabBookingComponent } from './lab-booking/lab-booking.component';
import { LabAvailabilityComponent } from './lab-availability/lab-availability.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { BookingHistoryComponent } from './booking-history/booking-history.component';
import { EditReservationComponent } from './edit-reservation/edit-reservation.component';

const routes: Routes = [
    { path: '', redirectTo: '/welcome', pathMatch: 'full' }, 
    { path: 'welcome' , component: WelcomeComponent},
    { path: 'login', component: LoginComponent},
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: StudDashboardComponent },
    { path: 'logout', component: WelcomeComponent },
    { path: 'booklab/:id', component: LabBookingComponent },
    { path: 'labs', component: StudDashboardComponent },
    { path: 'availability', component: LabAvailabilityComponent },
    { path: 'profile', component: UserProfileComponent },
    { path: 'history', component: BookingHistoryComponent },
    { path: 'editReservation', component: EditReservationComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
