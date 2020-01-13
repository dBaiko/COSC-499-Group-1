import {TestBed} from '@angular/core/testing';

import {FormValidationService} from './form-validation.service';

describe('FormValidatorService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FormValidationService]
        });
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        const service: FormValidationService = TestBed.get(FormValidationService);
        expect(service).toBeTruthy();
    });


});
