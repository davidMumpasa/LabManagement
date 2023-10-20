import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-lab-availability',
  templateUrl: './lab-availability.component.html',
  styleUrls: ['./lab-availability.component.css']
})
export class LabAvailabilityComponent {
  lab_availabilities: any[] = [];
  searchTerm = '';
  filteredLabs: any[] = [];
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchLabs();
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  fetchLabs(): void {
    this.authService.getLab_availabilities().subscribe(
      (data) => {
        this.lab_availabilities = data;
        this.filteredLabs = data;  
      },
      (error) => {
        console.error('Error fetching labs:', error);
      }
    );
  }

  filterLabs(): void {
    if (!this.searchTerm) {
      this.filteredLabs = this.lab_availabilities;
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredLabs = this.lab_availabilities.filter((lab) =>
      lab.lab_name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }
}
