import { TestBed } from '@angular/core/testing';

import { AnalysisStudentService } from '../analysis-student-service';

describe('AnalysisStudentService', () => {
  let service: AnalysisStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalysisStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
