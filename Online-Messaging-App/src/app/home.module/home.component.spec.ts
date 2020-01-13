import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HomeComponent} from './home.component';
import {AuthenticationService} from "../shared/authentication.service";
import {LogoutFormComponent} from "./logout/logout-form.component";
import {CommonService} from "../shared/common.service";
import {RouterTestingModule} from '@angular/router/testing';
import {FormBuilder} from "@angular/forms";

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomeComponent, LogoutFormComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [AuthenticationService, CommonService, FormBuilder],
            imports: [
                RouterTestingModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
