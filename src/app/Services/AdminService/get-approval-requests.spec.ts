import { TestBed } from '@angular/core/testing';

import { GetApprovalRequests } from './get-approval-requests';

describe('GetApprovalRequests', () => {
  let service: GetApprovalRequests;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetApprovalRequests);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
