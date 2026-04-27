import { TestBed } from '@angular/core/testing';

import { UpdateStatus } from './update-status';

describe('UpdateStatus', () => {
  let service: UpdateStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
