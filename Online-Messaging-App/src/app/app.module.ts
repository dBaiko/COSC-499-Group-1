import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {HomeModule} from "./home/home.module";
import {LoginModule} from "./login/login.module";
import {BrowserAnimationsModule, NoopAnimationsModule} from "@angular/platform-browser/animations";


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        AppRoutingModule,
        HttpClientModule,
        HomeModule,
        LoginModule,
        BrowserAnimationsModule,
        NoopAnimationsModule
    ],

    bootstrap: [AppComponent]
})
export class AppModule {
}
