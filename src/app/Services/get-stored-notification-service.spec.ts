import { TestBed } from '@angular/core/testing';

import { GetStoredNotificationService } from './get-stored-notification-service';

describe('GetStoredNotificationService', () => {
  let service: GetStoredNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetStoredNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
