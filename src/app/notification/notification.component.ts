import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  template: `
    <div class="notification-container">
      <h3 class="notification-title">{{ notification.title }}</h3>
      <p class="notification-content">{{ notification.content }}</p>
      <p class="notification-timestamp">{{ notification.timestamp }}</p>
    </div>
  `,
  styles: [
    `
      .notification-container {
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 15px;
        margin: 10px;
        border-radius: 8px;
        max-width: 250px;
        transition: transform 0.3s ease-in-out;
      }
      .notification-title{
        color: red; 
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .notification-timestamp{
        color: #555;
        font-size: 14px;
      }
      .notification-container:hover {
        transform: scale(1.02);
      }

      .notification-content {
        color: #555;
        font-size: 14px;
      }
    `,
  ],
})
export class NotificationComponent {
  @Input() notification: any;
}
