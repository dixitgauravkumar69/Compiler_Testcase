import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditViewComponent } from './audit-view-component';

describe('AuditViewComponent', () => {
  let component: AuditViewComponent;
  let fixture: ComponentFixture<AuditViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
