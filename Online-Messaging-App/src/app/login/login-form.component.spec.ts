import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginFormComponent } from "./login-form.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonService } from "../shared/common.service";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthenticationService } from "../shared/authentication.service";
import { FormValidationService } from "../shared/form-validation.service";

describe("LoginComponent", () => {
    let component: LoginFormComponent;
    let fixture: ComponentFixture<LoginFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoginFormComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule],
            providers: [CommonService, AuthenticationService, FormValidationService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
