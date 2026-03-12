import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindPlacementInfo } from './find-placement-info';

describe('FindPlacementInfo', () => {
  let component: FindPlacementInfo;
  let fixture: ComponentFixture<FindPlacementInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindPlacementInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(FindPlacementInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
