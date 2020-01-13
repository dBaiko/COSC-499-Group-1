import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LogoutFormComponent} from './logout-form.component';
import {AuthenticationService} from "../../shared/authentication.service";
import {CommonService} from "../../shared/common.service";
import {RouterTestingModule} from "@angular/router/testing";

describe('LogoutComponent', () => {
    let component: LogoutFormComponent;
    let fixture: ComponentFixture<LogoutFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LogoutFormComponent],
            providers: [AuthenticationService, CommonService],
            imports: [RouterTestingModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LogoutFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
