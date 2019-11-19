import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { AuthenticationService } from "./shared/authentication.service";
import {FormsModule} from "@angular/forms";
import { LoginComponent } from './login/login.component';
import { RegisterRedirectComponent } from './login/register-redirect/register-redirect.component';
import { HomeComponent } from './home/home.component';
import { LogoutComponent } from "./home/logout/logout.component";
import {Common} from "./shared/common";
import {MaterialModule} from "./material/material.module";
import { HeaderComponent } from './home/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    RegisterRedirectComponent,
    HomeComponent,
    LogoutComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MaterialModule
  ],
  providers: [AuthenticationService, Common],
  bootstrap: [AppComponent]
})
export class AppModule { }
