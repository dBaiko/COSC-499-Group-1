import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SettingsComponent } from "./settings.component";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { NotificationService } from "../../shared/notification.service";
import { CommonService } from "../../shared/common.service";
import { FormValidationService } from "../../shared/form-validation.service";
import { RouterTestingModule } from "@angular/router/testing";
import { MaterialModule } from "../../material/material.module";

describe("SettingsComponent", () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MaterialModule],
            declarations: [SettingsComponent],
            providers: [MessengerService, HttpClient, HttpHandler, AuthenticationService, NotificationService, CommonService, FormValidationService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
