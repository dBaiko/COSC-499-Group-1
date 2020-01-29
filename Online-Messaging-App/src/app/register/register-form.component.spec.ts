import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RegisterFormComponent } from "./register-form.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { MatInputModule } from "@angular/material/input";
import { AuthenticationService } from "../shared/authentication.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { CommonService } from "../shared/common.service";
import { FormValidationService } from "../shared/form-validation.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";

describe("RegisterComponent", () => {
    let component: RegisterFormComponent;
    let fixture: ComponentFixture<RegisterFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RegisterFormComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, ReactiveFormsModule, MatInputModule, BrowserAnimationsModule, RouterTestingModule],
            providers: [AuthenticationService, HttpClient, HttpHandler, CommonService, FormValidationService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should fail no value email", () => {
        let email = component.registerForm.controls["email"];
        expect(email.valid).toBeFalsy();
    });

    it("should pass valid email", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue("test@test.com");

        errors = email.errors || {};

        expect(errors["email"]).toBeFalsy();

    });

    it("should fail imvalid email", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue("notAnEmail");

        errors = email.errors || {};

        expect(errors["email"]).toBeTruthy();

    });

    it("should fail invalid email", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue("@test.com");

        errors = email.errors || {};

        expect(errors["email"]).toBeTruthy();

    });

    it("should fail invalid email", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue(123);

        errors = email.errors || {};

        expect(errors["email"]).toBeTruthy();

    });

    it("should fail invalid email", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue("👌");

        errors = email.errors || {};

        expect(errors["email"]).toBeTruthy();

    });

    it("should fail invalid email emoji", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue("👌@test.com");

        errors = email.errors || {};

        expect(errors["email"]).toBeTruthy();

    });

});
