import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthenticationService } from "../../shared/authentication.service";
import { APIConfig, Constants, SettingsObject, UserObject, UserProfileObject } from "../../shared/app-config";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { FormValidationService } from "../../shared/form-validation.service";
import { CommonService } from "../../shared/common.service";

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

    constructor(private auth: AuthenticationService, private http: HttpClient, public formValidationService: FormValidationService, public common: CommonService) {
    }

    ngOnInit() {
        this.passwordForm = new FormGroup(
            {
                password: new FormControl(Constants.EMPTY, Validators.compose([Validators.required, Validators.minLength(8)])),
                confirmPassword: new FormControl(Constants.EMPTY, Validators.compose([Validators.required])),
                oldPassword: new FormControl(Constants.EMPTY, Validators.compose([Validators.required]))
            },
            { validators: this.formValidationService.checkIfPasswordsMatch }
        );

        this.emailForm = new FormGroup({
            email: new FormControl(Constants.EMPTY, Validators.compose([Validators.required, Validators.email]))
        });

    }

    themeToggle($event): void {
        if ($event.checked) {
            this.themeEvent.emit(DARK);
            this.saveTheme(DARK);
        } else {
            this.themeEvent.emit(LIGHT);
            this.saveTheme(LIGHT);
        }
    }

    explicitToggle(event): void {
        if (event.checked) {
            this.explicitEvent.emit(true);
            this.saveExplicit(true);
        } else {
            this.explicitEvent.emit(false);
            this.saveExplicit(false);
        }
    }

    changePasswordFormSubmit(form: FormGroup): void {
        this.changePasswordSubmitAttempt = true;
        this.successMessage = Constants.EMPTY;
        this.errorMessage = Constants.EMPTY;
        if (form.valid) {
            this.auth.changePassword(form.value.oldPassword, form.value.password)
                .then((result) => {
                    this.successMessage = "Password updated successfully";
                })
                .catch((err: Error) => {
                    this.errorMessage = err.message;
                });
        }
    }

    emailFormSubmit(form: FormGroup): void {
        this.emailFormSubmitAttempt = true;
        if (form.valid) {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    let body = {
                        username: this.userProfile.username,
                        email: form.value.email
                    };

                    this.http.put(this.usersAPI + this.auth.getAuthenticatedUser().getUsername(), body, httpHeaders).subscribe(
                        (data: Array<UserObject>) => {
                            let user: UserObject = data[0];
                            if (user) {
                                this.userProfile.email = user.email;
                                this.editingEmail = false;
                            }
                        },
                        (err) => {
                            console.log(err);
                        }
                    );

                },
                (error => {
                    console.log(error);
                })
            );
        }
    }

    private saveExplicit(explicit: boolean) {
        this.updateSettings(this.settings.theme, explicit);
    }

    private saveTheme(themeString: string) {
        this.updateSettings(themeString, this.settings.explicit);
    }

    private updateSettings(themeString: string, explicit: boolean) {
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
                        (SettingsObject) => {
                            console.log("Settings updated successfully.");
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
            },
            (err) => {
                console.log(err);
            }
        );
    }
}
