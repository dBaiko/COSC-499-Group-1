import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfileComponent } from "./profile.component";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { NotificationService } from "../../shared/notification.service";
import { CommonService } from "../../shared/common.service";
import { RouterTestingModule } from "@angular/router/testing";
import { FormValidationService } from "../../shared/form-validation.service";

describe("ProfileComponent", () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [ProfileComponent],
            providers: [HttpClient, HttpHandler, AuthenticationService, NotificationService, CommonService, FormValidationService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
