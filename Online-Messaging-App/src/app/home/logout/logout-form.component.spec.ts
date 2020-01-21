import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LogoutFormComponent} from './logout-form.component';
import {AuthenticationService} from "../../shared/authentication.service";
import {CommonService} from "../../shared/common.service";
import {RouterTestingModule} from "@angular/router/testing";
import {routes} from "../../app-routing.module";
import {HomeComponent} from "../home.component";
import {HeaderComponent} from "../header/header.component";
import {MaterialModule} from "../../material/material.module";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChatboxComponent} from "../chatbox/chatbox.component";

describe('LogoutComponent', () => {
    let component: LogoutFormComponent;
    let fixture: ComponentFixture<LogoutFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                LogoutFormComponent,
                HomeComponent,
                HeaderComponent,
                SidebarComponent,
                ChatboxComponent
            ],
            providers: [AuthenticationService, CommonService],
            imports: [
                RouterTestingModule.withRoutes(routes),
                MaterialModule,
                ReactiveFormsModule,
                FormsModule
            ]
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
