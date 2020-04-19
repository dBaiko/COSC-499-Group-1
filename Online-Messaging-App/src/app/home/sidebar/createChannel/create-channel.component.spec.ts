import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CreateChannelComponent } from "./create-channel.component";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../../shared/authentication.service";
import { NotificationService } from "../../../shared/notification.service";
import { CommonService } from "../../../shared/common.service";
import { RouterTestingModule } from "@angular/router/testing";
import { FormValidationService } from "../../../shared/form-validation.service";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MaterialModule } from "../../../material/material.module";
import { MatRadioModule } from "@angular/material/radio";

describe("CreateChannelComponent", () => {
    let component: CreateChannelComponent;
    let fixture: ComponentFixture<CreateChannelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MaterialModule, MatDialogModule, MatRadioModule],
            declarations: [CreateChannelComponent],
            providers: [FormValidationService, HttpClient, HttpHandler, AuthenticationService, NotificationService, CommonService, {
                provide: MatDialogRef,
                useValue: {}
            }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateChannelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
