import { TestBed } from '@angular/core/testing';

import { MessengerService } from './messenger.service';

describe('MessagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessengerService = TestBed.get(MessengerService);
    expect(service).toBeTruthy();
  });
});
