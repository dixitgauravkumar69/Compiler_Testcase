import { TestBed } from '@angular/core/testing';

import { CodeSimilarity } from './code-similarity';

describe('CodeSimilarity', () => {
  let service: CodeSimilarity;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeSimilarity);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
