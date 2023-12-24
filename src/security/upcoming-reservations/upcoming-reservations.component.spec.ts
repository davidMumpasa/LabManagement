import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingReservationsComponent } from './upcoming-reservations.component';

describe('UpcomingReservationsComponent', () => {
  let component: UpcomingReservationsComponent;
  let fixture: ComponentFixture<UpcomingReservationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpcomingReservationsComponent]
    });
    fixture = TestBed.createComponent(UpcomingReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
