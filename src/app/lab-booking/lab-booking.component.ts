import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-lab-booking',
  templateUrl: './lab-booking.component.html',
  styleUrls: ['./lab-booking.component.css']
})
export class LabBookingComponent implements OnInit {
  bookingForm: FormGroup;
  labId: number | null;
  currentDate: Date = new Date();

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    
  ) {
    this.bookingForm = this.formBuilder.group({
      booking_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      purpose: ['', Validators.required]
    });

    // Get the lab ID from the URL using ActivatedRoute
    const labIdParam = this.route.snapshot.paramMap.get('id');
    this.labId = labIdParam ? +labIdParam : null; 
  } 

  ngOnInit(): void {}

  getDate(){
    this.currentDate = new Date();
    const year = this.currentDate.getFullYear();
    const month = (this.currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = this.currentDate.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
 
    return formattedDate
  }

  getTime(){
    this.currentDate = new Date();
    const hours = this.currentDate.getHours().toString().padStart(2, '0');
    const minutes = this.currentDate.getMinutes().toString().padStart(2, '0');
 
    const formatedTime = `${hours}:${minutes}`;
    
    return formatedTime
  }

  bookLab() {
    if (this.labId !== null && this.bookingForm.valid) {
      const { booking_date, start_time, end_time, purpose } = this.bookingForm.value;
  
      const currentDate = new Date();
      const selectedDate = new Date(booking_date);
      const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
      const selectedStartTime = parseInt(start_time.split(':')[0]) * 60 + parseInt(start_time.split(':')[1]);
      const selectedEndTime = parseInt(end_time.split(':')[0]) * 60 + parseInt(end_time.split(':')[1]);
  
      if (selectedDate <= currentDate) {
        alert('Selected date must be in the future');
      } else if (selectedDate.getTime() === currentDate.getTime() && selectedStartTime <= currentTime) {
        alert('Selected start time must be in the future');
      } else if (selectedEndTime <= selectedStartTime) {
        alert('End time must be greater than start time');
      } else {
        console.log('*********************************');
        console.log(booking_date + ' -- ' + start_time + ' -- ' + end_time);
        console.log('*********************************');
  
        this.authService.labBooking(this.labId, booking_date, start_time, end_time, purpose).subscribe(
          (response) => {
            // Handle the successful booking response here
            console.log('Lab booking successful', response);
            alert('Booking was successful');
          },
          (error) => {
            // Handle booking error here
            console.error('Lab booking error', error);
            alert('Booking Failed');
          }
        );
      }
    } else {
      alert('Please fill the form');
    }
  }
  
  
  
}
