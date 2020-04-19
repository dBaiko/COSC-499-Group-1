import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { NotificationService } from "../../shared/notification.service";
import { CommonService } from "../../shared/common.service";
import { FormValidationService } from "../../shared/form-validation.service";
import { RouterTestingModule } from "@angular/router/testing";
import { MaterialModule } from "../../material/material.module";
import { SidebarComponent } from "./sidebar.component";
import { CookieService } from "ngx-cookie-service";

describe("SidebarComponent", () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MaterialModule],
            declarations: [SidebarComponent],
            providers: [MessengerService, HttpClient, HttpHandler, AuthenticationService, NotificationService, CommonService, FormValidationService, CookieService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
