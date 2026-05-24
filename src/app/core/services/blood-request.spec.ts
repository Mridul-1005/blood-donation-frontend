import { TestBed } from '@angular/core/testing';

import { BloodRequest } from './blood-request';

describe('BloodRequest', () => {
  let service: BloodRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloodRequest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
