import { ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChatboxComponent } from "./chatbox.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { MaterialModule } from "../../material/material.module";
import { NotificationService } from "../../shared/notification.service";
import { CommonService } from "../../shared/common.service";
import { CommonModule } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import { SocketIoConfig, SocketIoModule } from "ngx-socket-io";

const socketConfig: SocketIoConfig = {
    url: "http://localhost:8080",
    options: {}
};

describe("ChatboxComponent", () => {
    let component: ChatboxComponent;
    let fixture: ComponentFixture<ChatboxComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
            declarations: [ChatboxComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, ReactiveFormsModule, MaterialModule, CommonModule, RouterTestingModule, SocketIoModule.forRoot(socketConfig)],
            providers: [MessengerService, HttpClient, HttpHandler, AuthenticationService, NotificationService, CommonService]
        }).compileComponents();
        let notificationService = NotificationService.getInstance();
        notificationService.getSocket("TestUser");
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", fakeAsync(() => {
        expect(component).toBeTruthy();
    }));
});
