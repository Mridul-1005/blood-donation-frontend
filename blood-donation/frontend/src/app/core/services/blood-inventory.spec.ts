import { TestBed } from '@angular/core/testing';

import { BloodInventory } from './blood-inventory';

describe('BloodInventory', () => {
  let service: BloodInventory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloodInventory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
