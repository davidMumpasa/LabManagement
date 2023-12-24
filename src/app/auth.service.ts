import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse } from './auth.model';
import { Time } from '@angular/common';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private notificationsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public notifications$: Observable<any[]> = this.notificationsSubject.asObservable();
  private loginUrl = 'http://127.0.0.1:5000/login';
  private registerUrl = 'http://127.0.0.1:5000/register';
  private labsApiUrl = 'http://127.0.0.1:5000/labs';
  private labApiUrl = 'http://127.0.0.1:5000/getLab';
  private logoutApiUrl = 'http://127.0.0.1:5000/logout';
  private bookApiUrl = 'http://127.0.0.1:5000/book';
  private labAvailabilities = 'http://127.0.0.1:5000/getAvailability';
  private getUserUrl = 'http://127.0.0.1:5000/getUser';
  private editUserUrl = "http://127.0.0.1:5000/editUser";
  private bookingHistory = "http://127.0.0.1:5000/bookingHistory";
  private deleteReservationUrl = "http://127.0.0.1:5000/cancelReservation";
  private updateReservationUrl = "http://127.0.0.1:5000/updateReservation";
  private reservationUrl = 'http://127.0.0.1:5000/reservations';
  private notificationUrl = 'http://127.0.0.1:5000/notifications';

  constructor(private http: HttpClient) {}

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  private httpOptions2 = {
    headers: new HttpHeaders({
      'Content-Type': 'multipart/form-data',
    })
  };

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
  
    // Make the login request
    return this.http.post<LoginResponse>(this.loginUrl, JSON.stringify(body), this.httpOptions).pipe(
      tap((response) => {
        // If the login is successful and the server returns an access_token, store it
        if (response && response.access_token) {
          this.storeToken(response.access_token);
        }
      })
    );
  }

  register(formData: FormData): Observable<any> {
    return this.http.post(this.registerUrl, formData, this.httpOptions);
  }

  storeToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(this.logoutApiUrl, { headers });
  }

  getHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      });
    } else {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
  }

  getLabs(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.labsApiUrl, { headers });
  }

  getLab(labId: number): Observable<any> {
    const headers = this.getHeaders();
    const apiUrl = `${this.labApiUrl}/${labId}`;
    return this.http.get<any>(apiUrl, { headers });
  }

  labBooking(labId: number, booking_date: Date, start_time: Time, end_time: Time, purpose: string): Observable<any> {
    const body = { labId, booking_date, start_time, end_time, purpose };
    const headers = this.getHeaders();
    const apiUrl = `${this.bookApiUrl}/${labId}`;
    return this.http.post(apiUrl, JSON.stringify(body), { headers });
  }

  getLab_availabilities(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.labAvailabilities, { headers });
  }

  getUserProfile(userId: number): Observable<any> {
    const headers = this.getHeaders();
    const apiUrl = `${this.getUserUrl}/${userId}`;
    return this.http.get<any>(apiUrl, { headers });
  }

  editUserProfile(formData: FormData): Observable<any> {
    return this.http.put(this.editUserUrl, formData);
}


  deleteReservation(booking_id: number): Observable<any> {
    const headers = this.getHeaders();
    const apiUrl = `${this.deleteReservationUrl}/${booking_id}`;
    return this.http.delete<any>(apiUrl, { headers });
  }

  getBooking_history(user_id: number): Observable<any[]> {
    const headers = this.getHeaders();
    const apiUrl = `${this.bookingHistory}/${user_id}`;
    return this.http.get<any[]>(apiUrl,{ headers });
  }

  updateReservation(booking_id: number, booking_date: Date, start_time: Time, end_time: Time, purpose: string, user_id: number, lab_id: number): Observable<any> {
    const body = {booking_date, start_time, end_time, purpose, user_id , lab_id};
    const headers = this.getHeaders();
    const apiUrl = `${this.updateReservationUrl}/${booking_id}`;
    return this.http.put(apiUrl, JSON.stringify(body), { headers });
  }

  decodeUserIdFromToken(token: string): number | null {
    try {
      const decodedToken: any = jwt_decode(token);
      // Replace 'user_id' with the actual key used in your JWT token for the user ID
      const userId: number = decodedToken.user_id;
      return userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getReservations(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.reservationUrl, { headers });
  }
  

  getNotificationsFromBackend(): Observable<any[]>{
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.notificationUrl, { headers });
  }

  getNotifications(): any[] {
    return this.notificationsSubject.value;
  }

  setNotifications(notifications: any[]): void {
    this.notificationsSubject.next(notifications);
  }

}
