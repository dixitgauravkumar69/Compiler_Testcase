import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetLiveProblems } from './get-live-problems';

describe('GetLiveProblems', () => {
  let component: GetLiveProblems;
  let fixture: ComponentFixture<GetLiveProblems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetLiveProblems],
    }).compileComponents();

    fixture = TestBed.createComponent(GetLiveProblems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
