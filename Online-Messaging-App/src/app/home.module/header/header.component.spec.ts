import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HeaderComponent} from './header.component';
import {LogoutFormComponent} from "../logout/logout-form.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {AuthenticationService} from "../../shared/authentication.service";
import {RouterTestingModule} from "@angular/router/testing";
import {LoginFormComponent} from "../../login/login-form.component";

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HeaderComponent, LogoutFormComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [AuthenticationService],
            imports: [
                RouterTestingModule.withRoutes({"/login", component: LoginFormComponent})
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
