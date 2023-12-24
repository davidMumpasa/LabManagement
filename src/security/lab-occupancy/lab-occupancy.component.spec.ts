import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabOccupancyComponent } from './lab-occupancy.component';

describe('LabOccupancyComponent', () => {
  let component: LabOccupancyComponent;
  let fixture: ComponentFixture<LabOccupancyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LabOccupancyComponent]
    });
    fixture = TestBed.createComponent(LabOccupancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
