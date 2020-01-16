import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HeaderComponent} from './header.component';
import {LogoutFormComponent} from "../logout/logout-form.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {AuthenticationService} from "../../shared/authentication.service";
import {RouterTestingModule} from "@angular/router/testing";
import {routes} from "../../app-routing.module";
import {HomeComponent} from "../home.component";

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                HeaderComponent,
                LogoutFormComponent,
                HomeComponent
            ],
            imports: [
                RouterTestingModule.withRoutes(routes)
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [AuthenticationService],
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
