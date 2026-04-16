import { TestBed } from '@angular/core/testing';

import { ConnectSSE } from './connect-sse';

describe('ConnectSSE', () => {
  let service: ConnectSSE;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectSSE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
