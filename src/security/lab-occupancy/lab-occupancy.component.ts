// lab-occupancy.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-lab-occupancy',
  templateUrl: './lab-occupancy.component.html',
  styleUrls: ['./lab-occupancy.component.css']
})
export class LabOccupancyComponent implements OnInit {
  labs: any[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getLabs().subscribe(
      (data) => {
        if (Array.isArray(data)) {
          this.labs = data;
        } else {
          console.error('Invalid response from getLabs:', data);
        }
      },
      (error) => {
        console.error('Error fetching labs:', error);
      }
    );
  }
}
