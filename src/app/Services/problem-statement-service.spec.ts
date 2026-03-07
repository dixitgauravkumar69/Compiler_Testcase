import { TestBed } from '@angular/core/testing';

import { ProblemStatementService } from './problem-statement-service';

describe('ProblemStatementService', () => {
  let service: ProblemStatementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProblemStatementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
