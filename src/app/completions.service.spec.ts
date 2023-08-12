import { TestBed } from '@angular/core/testing';

import { CompletionsService } from './completions.service';

describe('CompletionsService', () => {
  let service: CompletionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompletionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
