import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ChannelUserListComponent } from "./channel-user-list.component";
import { NotificationService } from "../../../shared/notification.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../../shared/authentication.service";
import { MaterialModule } from "../../../material/material.module";

describe("ChannelUserListComponent", () => {
    let component: ChannelUserListComponent;
    let fixture: ComponentFixture<ChannelUserListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ChannelUserListComponent],
            imports: [MaterialModule],
            providers: [NotificationService, HttpClient, HttpHandler, AuthenticationService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChannelUserListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
