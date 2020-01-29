import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule, NoopAnimationsModule } from "@angular/platform-browser/animations";
import { HomeModule } from "./home/home.module";
import { LoginModule } from "./login/login.module";
import { RegisterModule } from "./register/register.module";

@NgModule({
    declarations: [AppComponent],
    imports: [
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        HomeModule,
        LoginModule,
        RegisterModule
    ],

    bootstrap: [AppComponent]
})
export class AppModule {}
