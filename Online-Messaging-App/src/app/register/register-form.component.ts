import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../shared/authentication.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { APIConfig, Constants } from "../shared/app-config";
import { CommonService } from "../shared/common.service";
import { FormValidationService } from "../shared/form-validation.service";
import { ParentErrorStateMatcher } from "../shared/parent-error-state-matcher";

const USER_EXISTS_EX = "UsernameExistsException";

interface User {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

@Component({
    selector: "register-form",
    templateUrl: "./register-form.component.html",
    styleUrls: ["./register-form.component.scss"]
})
export class RegisterFormComponent implements OnInit {
    registerForm: FormGroup;

    matchingPasswordForm: FormGroup;

    submitAttempt: boolean = false;

    matcher = new ParentErrorStateMatcher();

    private url: string = APIConfig.usersAPI;

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient,
        public common: CommonService,
        public formValidationService: FormValidationService
    ) {
    }

    ngOnInit(): void {
        this.matchingPasswordForm = new FormGroup(
            {
                password: new FormControl(
                    Constants.EMPTY,
                    Validators.compose([Validators.required, Validators.minLength(8)])
                ),
                confirmPassword: new FormControl(Constants.EMPTY, Validators.compose([Validators.required]))
            },
            { validators: this.formValidationService.checkIfPasswordsMatch }
        );
        this.registerForm = new FormGroup({
            username: new FormControl(
                Constants.EMPTY,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(30),
                    this.formValidationService.noWhitespaceValidator,
                    this.formValidationService.noBadWordsValidator
                ])
            ),
            matchingPasswords: this.matchingPasswordForm,
            firstName: new FormControl(
                Constants.EMPTY,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(30),
                    this.formValidationService.noWhitespaceValidator,
                    this.formValidationService.noBadWordsValidator
                ])
            ),
            lastName: new FormControl(
                Constants.EMPTY,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(30),
                    this.formValidationService.noWhitespaceValidator,
                    this.formValidationService.noBadWordsValidator
                ])
            ),
            email: new FormControl(Constants.EMPTY, Validators.compose([Validators.required, Validators.email]))
        });
    }

    registerSubmit(form: FormGroup): void {
        this.submitAttempt = true;
        if (this.registerForm.valid) {
            this.register(
                form.value.username,
                form.value.matchingPasswords.password,
                form.value.email,
                form.value.firstName,
                form.value.lastName
            );
        }
    }

    register(username: string, password: string, email: string, firstName: string, lastName: string): void {
        email = this.common.sanitizeText(email);
        firstName = this.common.sanitizeText(firstName);
        lastName = this.common.sanitizeText(lastName);
        this.auth.register(username, password, email, firstName, lastName).subscribe(
            () => {
                this.addUser(username, email, firstName, lastName)
                    .then(() => {
                        this.common.routeTo(Constants.LOGIN_ROUTE);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            },
            (err) => {
                if (err.code == USER_EXISTS_EX) {
                    this.registerForm.get(Constants.USERNAME).setErrors({ alreadyTaken: true });
                }
            }
        );
    }

    addUser(username: string, email: string, firstName: string, lastName: string): Promise<Object> {
        let user: User = {
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName
        };

        return this.http.post(this.url, user, Constants.HTTP_OPTIONS).toPromise();
    }
}
