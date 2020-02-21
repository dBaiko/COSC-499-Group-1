import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { LogoutFormComponent } from "./logout-form.component";
import { AuthenticationService } from "../../shared/authentication.service";
import { CommonService } from "../../shared/common.service";
import { RouterTestingModule } from "@angular/router/testing";
import { routes } from "../../app-routing.module";
import { MaterialModule } from "../../material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HomeModule } from "../home.module";
import { RegisterModule } from "../../register/register.module";
import { LoginModule } from "../../login/login.module";

describe("LogoutComponent", () => {
    let component: LogoutFormComponent;
    let fixture: ComponentFixture<LogoutFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [AuthenticationService, CommonService],
            imports: [
                RouterTestingModule.withRoutes(routes),
                MaterialModule,
                ReactiveFormsModule,
                FormsModule,
                HomeModule,
                RegisterModule,
                LoginModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LogoutFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
