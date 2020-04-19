import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { APIConfig, Constants, SettingsObject, UserObject, UserProfileObject } from "../../shared/app-config";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FormValidationService } from "../../shared/form-validation.service";
import { CommonService } from "../../shared/common.service";
import { CognitoIdToken } from "amazon-cognito-identity-js";

const SETTINGS_URI = "/settings";
const DARK = "dark";
const LIGHT = "light";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.scss"]
})
export class SettingsComponent implements OnInit {
    @Output() themeEvent = new EventEmitter<string>();
    @Output() explicitEvent = new EventEmitter<boolean>();
    @Input()
    settings: SettingsObject;

    @Input() userProfile: UserProfileObject;
    passwordForm: FormGroup;
    emailForm: FormGroup;
    errorMessage: string;
    successMessage: string;
    changePasswordSubmitAttempt: boolean = false;
    emailFormSubmitAttempt: boolean = false;
    editingEmail: boolean = false;
    private usersAPI: string = APIConfig.usersAPI;

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient,
        public formValidationService: FormValidationService,
        public common: CommonService
    ) {
    }

    public ngOnInit() {
        this.passwordForm = new FormGroup(
            {
                password: new FormControl(
                    Constants.EMPTY,
                    Validators.compose([Validators.required, Validators.minLength(8)])
                ),
                confirmPassword: new FormControl(Constants.EMPTY, Validators.compose([Validators.required])),
                oldPassword: new FormControl(Constants.EMPTY, Validators.compose([Validators.required]))
            },
            { validators: this.formValidationService.checkIfPasswordsMatch }
        );

        this.emailForm = new FormGroup({
            email: new FormControl(Constants.EMPTY, Validators.compose([Validators.required, Validators.email]))
        });
    }

    public themeToggle($event): void {
        if ($event.checked) {
            this.themeEvent.emit(DARK);
            this.saveTheme(DARK);
        } else {
            this.themeEvent.emit(LIGHT);
            this.saveTheme(LIGHT);
        }
    }

    public explicitToggle(event): void {
        if (event.checked) {
            this.explicitEvent.emit(true);
            this.saveExplicit(true);
        } else {
            this.explicitEvent.emit(false);
            this.saveExplicit(false);
        }
    }

    public changePasswordFormSubmit(form: FormGroup): void {
        this.changePasswordSubmitAttempt = true;
        this.successMessage = Constants.EMPTY;
        this.errorMessage = Constants.EMPTY;
        if (form.valid) {
            this.auth
                .changePassword(form.value.oldPassword, form.value.password)
                .then(() => {
                    this.successMessage = "Password updated successfully";
                })
                .catch((err: Error) => {
                    this.errorMessage = err.message;
                });
        }
    }

    public emailFormSubmit(form: FormGroup): void {
        this.emailFormSubmitAttempt = true;
        if (form.valid) {
            this.auth.getCurrentSessionId().subscribe(
                (data: CognitoIdToken) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    let body = {
                        username: this.userProfile.username,
                        email: this.common.sanitizeText(form.value.email)
                    };

                    this.http
                        .put(this.usersAPI + this.auth.getAuthenticatedUser().getUsername(), body, httpHeaders)
                        .subscribe(
                            (data: Array<UserObject>) => {
                                this.editingEmail = false;
                                this.userProfile.email = this.common.sanitizeText(form.value.email);
                            },
                            (err) => {
                                console.error(err);
                            }
                        );
                },
                (error) => {
                    console.error(error);
                }
            );
        }
    }

    private saveExplicit(explicit: boolean): void {
        this.updateSettings(this.settings.theme, explicit);
    }

    private saveTheme(themeString: string): void {
        this.updateSettings(themeString, this.settings.explicit);
    }

    private updateSettings(themeString: string, explicit: boolean): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                let settings: SettingsObject = {
                    username: this.settings.username,
                    theme: themeString,
                    explicit: explicit
                };

                this.http
                    .put(
                        this.usersAPI + this.auth.getAuthenticatedUser().getUsername() + SETTINGS_URI,
                        settings,
                        httpHeaders
                    )
                    .subscribe(
                        () => {
                        },
                        (err) => {
                            console.error(err);
                        }
                    );
            },
            (err) => {
                console.error(err);
            }
        );
    }
}
