import { TestBed } from '@angular/core/testing';

import { AuditView } from './audit-view';

describe('AuditView', () => {
  let service: AuditView;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditView);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
