import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChatboxComponent } from "./chatbox.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { MessengerService } from "../../shared/messenger.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";

describe("ChatboxComponent", () => {
    let component: ChatboxComponent;
    let fixture: ComponentFixture<ChatboxComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ChatboxComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, ReactiveFormsModule],
            providers: [MessengerService, HttpClient, HttpHandler, AuthenticationService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
