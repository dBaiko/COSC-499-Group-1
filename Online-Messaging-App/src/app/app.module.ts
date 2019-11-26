import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {RegisterFormComponent} from './register/register-form.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LoginFormComponent} from './login/login-form.component';
import {RegisterRedirectComponent} from './login/register-redirect/register-redirect.component';
import {HomeComponent} from './home/home.component';
import {LogoutFormComponent} from "./home/logout/logout-form.component";
import {CommonService} from "./shared/common.service";
import {AuthenticationService} from "./shared/authentication.service";
import {HeaderComponent} from "./home/header/header.component";
import {MaterialModule} from "./material/material.module";
import {SidebarComponent} from './home/sidebar/sidebar.component';
import {FooterComponent} from './home/footer/footer.component';
import {ChatboxComponent} from './home/chatbox/chatbox.component';
import {FormValidationService} from "./shared/form-validation.service";
import {MessengerService} from "./shared/messenger.service";
import {SocketIoModule, SocketIoConfig} from "ngx-socket-io";

const socketConfig: SocketIoConfig = {url: 'http://localhost:8080', options: {}};

@NgModule({
  declarations: [
    AppComponent,
    RegisterFormComponent,
    LoginFormComponent,
    RegisterRedirectComponent,
    HomeComponent,
    HeaderComponent,
    LogoutFormComponent,
    SidebarComponent,
    FooterComponent,
    ChatboxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SocketIoModule.forRoot(socketConfig)
  ],
  providers: [AuthenticationService, CommonService, FormValidationService, MessengerService],

  bootstrap: [AppComponent]
})
export class AppModule {
}
