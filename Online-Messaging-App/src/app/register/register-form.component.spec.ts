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

    it("should fail invalid email with no @", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue("notAnEmail");

        errors = email.errors || {};

        expect(errors["email"]).toBeTruthy();
    });

    it("should fail invalid email without anything before @", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue("@test.com");

        errors = email.errors || {};

        expect(errors["email"]).toBeTruthy();
    });

    it("should fail invalid email of just numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let email = component.registerForm.controls["email"];
        email.setValue(123);

        errors = email.errors || {};

        expect(errors["email"]).toBeTruthy();
    });

    it("should fail invalid email emoji only", () => {
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

    it("should fail no value username", () => {
        let username = component.registerForm.controls["username"];
        expect(username.valid).toBeFalsy();
    });

    it("should pass valid username without numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let username = component.registerForm.controls["username"];
        username.setValue("test");

        errors = username.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should pass valid username with numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let username = component.registerForm.controls["username"];
        username.setValue("test123");

        errors = username.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should pass valid username with only numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let username = component.registerForm.controls["username"];
        username.setValue("123");

        errors = username.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should fail invalid username with only emoji", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let username = component.registerForm.controls["username"];
        username.setValue("🤦‍♂");

        errors = username.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail invalid username with only symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let username = component.registerForm.controls["username"];
        username.setValue(";!");

        errors = username.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail invalid username with symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let username = component.registerForm.controls["username"];
        username.setValue("asd!");

        errors = username.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });
    it("should fail invalid username with emoji", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let username = component.registerForm.controls["username"];
        username.setValue("asd💕");

        errors = username.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail no value first name", () => {
        let firstName = component.registerForm.controls["firstName"];
        expect(firstName.valid).toBeFalsy();
    });

    it("should pass valid first name without numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let firstName = component.registerForm.controls["firstName"];
        firstName.setValue("test");

        errors = firstName.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should pass valid first name with numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let firstName = component.registerForm.controls["firstName"];
        firstName.setValue("test123");

        errors = firstName.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should pass valid first name with only numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let firstName = component.registerForm.controls["firstName"];
        firstName.setValue("123");

        errors = firstName.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should fail invalid first name with only emoji", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let firstName = component.registerForm.controls["firstName"];
        firstName.setValue("🤦‍♂");

        errors = firstName.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail invalid first name with only symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let firstName = component.registerForm.controls["firstName"];
        firstName.setValue(";!");

        errors = firstName.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail invalid first name with symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let firstName = component.registerForm.controls["firstName"];
        firstName.setValue("asd!");

        errors = firstName.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });
    it("should fail invalid first name with emoji", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let firstName = component.registerForm.controls["firstName"];
        firstName.setValue("asd💕");

        errors = firstName.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail no value last name", () => {
        let lastName = component.registerForm.controls["lastName"];
        expect(lastName.valid).toBeFalsy();
    });

    it("should pass valid last name without numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let lastName = component.registerForm.controls["lastName"];
        lastName.setValue("test");

        errors = lastName.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should pass valid last name with numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let lastName = component.registerForm.controls["lastName"];
        lastName.setValue("test123");

        errors = lastName.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should pass valid last name with only numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let lastName = component.registerForm.controls["lastName"];
        lastName.setValue("123");

        errors = lastName.errors || {};

        expect(errors["pattern"]).toBeFalsy();
    });

    it("should fail invalid last name with only emoji", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let lastName = component.registerForm.controls["lastName"];
        lastName.setValue("🤦‍♂");

        errors = lastName.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail invalid last name with only symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let lastName = component.registerForm.controls["lastName"];
        lastName.setValue(";!");

        errors = lastName.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail invalid last name with symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let lastName = component.registerForm.controls["lastName"];
        lastName.setValue("asd!");

        errors = lastName.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });
    it("should fail invalid last name with emoji", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let lastName = component.registerForm.controls["lastName"];
        lastName.setValue("asd💕");

        errors = lastName.errors || {};

        expect(errors["pattern"]).toBeTruthy();
    });

    it("should fail no value password", () => {
        let password = component.matchingPasswordForm.controls["password"];
        expect(password.valid).toBeFalsy();
    });

    it("should pass valid password with only numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("12345678");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeFalsy();
    });

    it("should pass valid password with only letters", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("asdsaasdsadsadsa");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeFalsy();
    });

    it("should pass valid password with only symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeFalsy();
    });

    it("should pass valid password with only emoji", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("🤷‍♂️🤷‍♂️😉😎🤦‍♀️😁❤😂");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeFalsy();
    });

    it("should pass valid password with letters and symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("skajdlskdjals;;;;;;;;;");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeFalsy();
    });

    it("should pass valid password with numbers and symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("12312321';[.");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeFalsy();
    });

    it("should pass valid password with letters and numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("asdsadsadsa12312345");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeFalsy();
    });

    it("should fail invalid password with numbers and symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("123;;");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeTruthy();
    });

    it("should fail invalid password with letters and symbols", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("ifad;;");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeTruthy();
    });

    it("should fail invalid password with letters and numbers", () => {
        expect(component).toBeTruthy();

        let errors = {};

        let password = component.matchingPasswordForm.controls["password"];
        password.setValue("ifad58");

        errors = password.errors || {};

        expect(errors["minlength"]).toBeTruthy();
    });
});
