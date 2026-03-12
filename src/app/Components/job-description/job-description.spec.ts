import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDescription } from './job-description';

describe('JobDescription', () => {
  let component: JobDescription;
  let fixture: ComponentFixture<JobDescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDescription],
    }).compileComponents();

    fixture = TestBed.createComponent(JobDescription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
