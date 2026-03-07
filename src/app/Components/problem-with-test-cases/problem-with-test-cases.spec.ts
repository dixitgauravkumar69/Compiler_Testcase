import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemWithTestCases } from './problem-with-test-cases';

describe('ProblemWithTestCases', () => {
  let component: ProblemWithTestCases;
  let fixture: ComponentFixture<ProblemWithTestCases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProblemWithTestCases],
    }).compileComponents();

    fixture = TestBed.createComponent(ProblemWithTestCases);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
