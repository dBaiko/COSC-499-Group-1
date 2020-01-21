import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RegisterRedirectComponent} from "./register-redirect/register-redirect.component";
import {MaterialModule} from "../material/material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {FormValidationService} from "../shared/form-validation.service";
import {AuthenticationService} from "../shared/authentication.service";
import {CommonService} from "../shared/common.service";
import {LoginFormComponent} from "./login-form.component";
import {RouterModule} from "@angular/router";
import {LoginRoutingModule} from "./login-routing.module";
import {HomeModule} from "../home/home.module";


@NgModule({
    declarations: [
        RegisterRedirectComponent,
        LoginFormComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        HomeModule,
        HttpClientModule,
        RouterModule,
        LoginRoutingModule
    ],
    providers: [FormValidationService, AuthenticationService, CommonService],
    exports: [RegisterRedirectComponent]
})
export class LoginModule {
}
