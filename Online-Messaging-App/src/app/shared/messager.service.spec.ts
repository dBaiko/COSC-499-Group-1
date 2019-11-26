import { TestBed } from '@angular/core/testing';

import { MessagerService } from './messager.service';

describe('MessagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessagerService = TestBed.get(MessagerService);
    expect(service).toBeTruthy();
  });
});
