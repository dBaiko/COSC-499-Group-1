import { ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../material/material.module";
import { CommonModule } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import { SocketIoConfig, SocketIoModule } from "ngx-socket-io";
import { MessengerService } from "../shared/messenger.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../shared/authentication.service";
import { NotificationService } from "../shared/notification.service";
import { CommonService } from "../shared/common.service";
import { HomeComponent } from "./home.component";
import { CookieService } from "ngx-cookie-service";
import { RegisterFormComponent } from "../register/register-form.component";
import { LoginFormComponent } from "../login/login-form.component";
import { ProfileComponent } from "./profile/profile.component";

const socketConfig: SocketIoConfig = {
    url: "http://localhost:8080",
    options: {}
};

describe("HomeComponent", () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
            declarations: [HomeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, ReactiveFormsModule, MaterialModule, CommonModule, RouterTestingModule.withRoutes([
                { path: "", component: HomeComponent },
                { path: "register", component: RegisterFormComponent },
                { path: "login", component: LoginFormComponent },
                { path: "profile", component: ProfileComponent }
            ]), SocketIoModule.forRoot(socketConfig)],
            providers: [MessengerService, HttpClient, HttpHandler, AuthenticationService, NotificationService, CommonService, CookieService]
        }).compileComponents();
        let notificationService = NotificationService.getInstance();
        notificationService.getSocket("TestUser");
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", fakeAsync(() => {
        expect(component).toBeTruthy();
    }));
});
