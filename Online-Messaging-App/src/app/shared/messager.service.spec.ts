import {async, TestBed} from "@angular/core/testing";

import {MessengerService} from "./messenger.service";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

describe("MessagerService", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [MessengerService]
        })
            .compileComponents();
    }));

    it("should be created", () => {
        const service: MessengerService = TestBed.get(MessengerService);
        expect(service).toBeTruthy();
    });
});
