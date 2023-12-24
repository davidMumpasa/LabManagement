import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

// Assuming you have a method in AuthService to fetch notifications
loadNotifications() {
  this.authService.getNotificationsFromBackend().subscribe(
    (notifications) => {
      this.notifications = notifications;
    },
    (error) => {
      console.error('Error loading notifications:', error);
    }
  );
}

}
