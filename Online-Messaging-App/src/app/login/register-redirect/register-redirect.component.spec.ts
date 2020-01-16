import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {routes} from "../../app-routing.module";

import {RegisterRedirectComponent} from './register-redirect.component';
import {RouterTestingModule} from "@angular/router/testing";
import {HomeComponent} from "../../home/home.component";
import {HeaderComponent} from "../../home/header/header.component";
import {MaterialModule} from "../../material/material.module";
import {SidebarComponent} from "../../home/sidebar/sidebar.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChatboxComponent} from "../../home/chatbox/chatbox.component";
import {LogoutFormComponent} from "../../home/logout/logout-form.component";
import {HomeModule} from "../../home/home.module";

describe('RegisterRedirectComponent', () => {
    let component: RegisterRedirectComponent;
    let fixture: ComponentFixture<RegisterRedirectComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                RegisterRedirectComponent,
            ],
            imports: [
                RouterTestingModule.withRoutes(routes),
                MaterialModule,
                ReactiveFormsModule,
                FormsModule,
                HomeModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterRedirectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
