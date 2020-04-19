import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { FriendsBrowserComponent } from "./friends-browser.component";
import { MessengerService } from "../../../shared/messenger.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../../shared/authentication.service";
import { NotificationService } from "../../../shared/notification.service";
import { CommonService } from "../../../shared/common.service";
import { RouterTestingModule } from "@angular/router/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../../../material/material.module";

describe("FriendsBrowserComponent", () => {
    let component: FriendsBrowserComponent;
    let fixture: ComponentFixture<FriendsBrowserComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, MaterialModule],
            declarations: [FriendsBrowserComponent],
            providers: [MessengerService, HttpClient, HttpHandler, AuthenticationService, NotificationService, CommonService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FriendsBrowserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
