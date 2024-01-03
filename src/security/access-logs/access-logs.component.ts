import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';


@Component({
  selector: 'app-access-logs',
  templateUrl: './access-logs.component.html',
  styleUrls: ['./access-logs.component.css']
})
export class AccessLogsComponent implements OnInit {
  accessLogs: any[] = [];
  router: any;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchAccessLogs();
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
  fetchAccessLogs(): void {
    this.authService.getAccessLogs().subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.accessLogs = data.map(log => {
            // Extract "yes" or "no" from the "action" field
            const confirmationStatus = log.action.split(' ')[1].toLowerCase();

            // Set isYes and isNo properties based on confirmationStatus
            return {
              ...log,
              isYes: confirmationStatus === 'yes',
              isNo: confirmationStatus === 'no'
            };
          });
        } else {
          console.error('Invalid response from getAccessLogs:', data);
        }
      },
      (error) => {
        console.error('Error fetching access logs:', error);
      }
    );
  }
}