import { ChannelBrowserComponent } from "./channel-browser.component";
import { ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../../material/material.module";
import { CommonModule } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { CommonService } from "../../shared/common.service";

describe("ChannelBrowserComponent", () => {
    let component: ChannelBrowserComponent;
    let fixture: ComponentFixture<ChannelBrowserComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChannelBrowserComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [FormsModule, ReactiveFormsModule, MaterialModule, CommonModule, RouterTestingModule],
            providers: [HttpClient, HttpHandler, AuthenticationService, CommonService]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChannelBrowserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", fakeAsync(() => {
        expect(component).toBeTruthy();
    }));

});
