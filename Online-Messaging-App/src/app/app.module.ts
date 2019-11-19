import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {RegisterFormComponent} from './register/register-form.component';
import {FormsModule} from "@angular/forms";
import {LoginFormComponent} from './login/login-form.component';
import {RegisterRedirectComponent} from './login/register-redirect/register-redirect.component';
import {HomeComponent} from './home/home.component';
import {LogoutFormComponent} from "./home/logout/logout-form.component";
import {CommonService} from "./shared/common.service";
import {AuthenticationService} from "./shared/authentication.service";
import {HeaderComponent} from "./home/header/header.component";
import {MaterialModule} from "./material/material.module";

@NgModule({
  declarations: [
    AppComponent,
    RegisterFormComponent,
    LoginFormComponent,
    RegisterRedirectComponent,
    HomeComponent,
    HeaderComponent,
    LogoutFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MaterialModule
  ],
  providers: [AuthenticationService, CommonService],

  bootstrap: [AppComponent]
})
export class AppModule {
}
