import { async, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { routes } from "./app-routing.module";
import { HomeModule } from "./home/home.module";
import { RegisterFormComponent } from "./register/register-form.component";
import { MaterialModule } from "./material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginModule } from "./login/login.module";

describe("AppComponent", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent, RegisterFormComponent],
            imports: [
                RouterTestingModule.withRoutes(routes),
                HomeModule,
                MaterialModule,
                FormsModule,
                ReactiveFormsModule,
                LoginModule
            ]
        }).compileComponents();
    }));

    it("should create the app", () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title "Online-Messaging-App"`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.title).toEqual("Online-Messaging-App");
    });
});
