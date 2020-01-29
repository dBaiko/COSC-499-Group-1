import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RegisterFormComponent } from "./register-form.component";
import { MaterialModule } from "../material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HomeModule } from "../home/home.module";
import { FormValidationService } from "../shared/form-validation.service";
import { AuthenticationService } from "../shared/authentication.service";
import { CommonService } from "../shared/common.service";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { RegisterRoutingModule } from "./register-routing.module";

@NgModule({
    declarations: [RegisterFormComponent],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        HomeModule,
        HttpClientModule,
        RouterModule,
        RegisterRoutingModule
    ],
    providers: [FormValidationService, AuthenticationService, CommonService]
})
export class RegisterModule {
}
