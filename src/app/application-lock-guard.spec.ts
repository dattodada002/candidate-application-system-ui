import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { applicationLockGuard } from './application-lock-guard';

describe('applicationLockGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => applicationLockGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
