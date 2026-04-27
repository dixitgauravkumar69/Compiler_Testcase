import { TestBed } from '@angular/core/testing';

import { AddAuditService } from './add-audit-service';

describe('AddAuditService', () => {
  let service: AddAuditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddAuditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
