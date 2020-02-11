import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { HeaderComponent } from "./header.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { AuthenticationService } from "../../shared/authentication.service";
import { RouterTestingModule } from "@angular/router/testing";
import { routes } from "../../app-routing.module";
import { HomeModule } from "../home.module";
import { RegisterModule } from "../../register/register.module";
import { LoginModule } from "../../login/login.module";

describe("HeaderComponent", () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HomeModule, RegisterModule, LoginModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [AuthenticationService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
