import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLogsComponent } from './access-logs.component';

describe('AccessLogsComponent', () => {
  let component: AccessLogsComponent;
  let fixture: ComponentFixture<AccessLogsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccessLogsComponent]
    });
    fixture = TestBed.createComponent(AccessLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
