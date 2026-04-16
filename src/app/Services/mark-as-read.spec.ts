import { TestBed } from '@angular/core/testing';

import { MarkAsRead } from './mark-as-read';

describe('MarkAsRead', () => {
  let service: MarkAsRead;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkAsRead);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
