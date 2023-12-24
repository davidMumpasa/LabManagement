import { Component } from '@angular/core';
import { NotificationsComponent } from '../notifications/notifications.component';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  showNotifications = false;
  constructor(private authService: AuthService) {}
  notifications = ['Notification 1', 'Notification 2', 'Notification 3'];

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  // You can call this method when new notifications are received
  updateNotifications(notifications: any[]): void {
    this.authService.setNotifications(notifications);
  }

}
