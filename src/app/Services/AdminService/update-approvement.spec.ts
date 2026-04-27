import { TestBed } from '@angular/core/testing';

import { UpdateApprovement } from './update-approvement';

describe('UpdateApprovement', () => {
  let service: UpdateApprovement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateApprovement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
