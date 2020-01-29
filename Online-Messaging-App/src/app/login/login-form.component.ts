import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthenticationService } from "../shared/authentication.service";
import { CommonService } from "../shared/common.service";
import { FormValidationService } from "../shared/form-validation.service";
import { Constants } from "../shared/app-config";

const NOT_AUTH_EX = "NotAuthorizedException";

@Component({
    selector: "login-form",
    templateUrl: "./login-form.component.html",
    styleUrls: ["./login-form.component.scss"]
})
export class LoginFormComponent implements OnInit {
    loginForm: FormGroup;

    submitAttempt: boolean = false;

    constructor(
        public common: CommonService,
        private auth: AuthenticationService,
        private formValidationService: FormValidationService
    ) {}

    ngOnInit(): void {
        this.loginForm = new FormGroup({
            username: new FormControl(
                Constants.EMPTY,
                Validators.compose([Validators.required])
            ),
            password: new FormControl(
                Constants.EMPTY,
                Validators.compose([Validators.required])
            )
        });
    }

    loginSubmit(form: FormGroup): void {
        this.submitAttempt = true;
        this.login(form.value.username, form.value.password);
    }

    login(username: string, password: string): void {
        this.auth.login(username, password).subscribe(
            data => {
                this.common.moveToHome();
            },
            err => {
                if (err.code == NOT_AUTH_EX) {
                    this.loginForm
                        .get(Constants.USERNAME)
                        .setErrors({ invalidLogin: true });
                }
            }
        );
    }
}
