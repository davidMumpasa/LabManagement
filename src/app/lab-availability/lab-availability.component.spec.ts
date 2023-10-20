import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabAvailabilityComponent } from './lab-availability.component';

describe('LabAvailabilityComponent', () => {
  let component: LabAvailabilityComponent;
  let fixture: ComponentFixture<LabAvailabilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LabAvailabilityComponent]
    });
    fixture = TestBed.createComponent(LabAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
