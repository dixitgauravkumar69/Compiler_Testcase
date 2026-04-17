import { TestBed } from '@angular/core/testing';

import { FindJobInfo } from './find-job-info';

describe('FindJobInfo', () => {
  let service: FindJobInfo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindJobInfo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
