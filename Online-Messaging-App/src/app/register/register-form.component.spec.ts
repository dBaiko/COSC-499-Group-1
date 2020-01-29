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
            imports: [
                FormsModule,
                ReactiveFormsModule,
                MatInputModule,
                BrowserAnimationsModule,
                RouterTestingModule
            ],
            providers: [
                AuthenticationService,
                HttpClient,
                HttpHandler,
                CommonService,
                FormValidationService
            ]
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
});
