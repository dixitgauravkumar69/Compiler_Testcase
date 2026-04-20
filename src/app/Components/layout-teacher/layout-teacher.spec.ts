import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutTeacher } from './layout-teacher';

describe('LayoutTeacher', () => {
  let component: LayoutTeacher;
  let fixture: ComponentFixture<LayoutTeacher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutTeacher],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutTeacher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
