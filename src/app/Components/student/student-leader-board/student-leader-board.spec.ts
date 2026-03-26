import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLeaderBoard } from './student-leader-board';

describe('StudentLeaderBoard', () => {
  let component: StudentLeaderBoard;
  let fixture: ComponentFixture<StudentLeaderBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentLeaderBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentLeaderBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
