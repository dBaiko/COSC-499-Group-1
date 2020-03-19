import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from "@angular/core";
import { APIConfig, Constants } from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "../../shared/common.service";
import { FormValidationService } from "../../shared/form-validation.service";
import { ProfileObject } from "../home.component";
import { ImageCompressor } from "../../shared/ImageCompressor";

interface UserObject {
    username: string;
    email: string;
}

interface UserProfileObject {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
}

const EMAIL_FORM_NAME = "email";
const LASTNAME_FORM_NAME = "lastName";
const FIRSTNAME_FORM_NAME = "firstName";

const ERROR_MESSAGE = "Your edit was not saved correctly";
const SUCCESS_MESSAGE = "Your edit was saved correctly";
const IMAGE_MESSAGE = "Your profile picture was updated successfully";

@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
    userProfile: UserProfileObject;
    editForm: FormGroup;
    imageForm: FormGroup;

    editing: boolean = false;
    submitAttempt: boolean = false;
    editSaveMessage: string = "";

    imageHover: boolean = false;
    @Output() profileUpdateEvent = new EventEmitter();
    private usersAPI = APIConfig.usersAPI;
    private profilesAPI = APIConfig.profilesAPI;
    private newProfileImage: File;

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient,
        private common: CommonService,
        private formValidationService: FormValidationService,
        private render: Renderer2
    ) {
    }

    private _profileView: string;

    get profileView(): string {
        return this._profileView;
    }

    @Input()
    set profileView(value: string) {
        this.userProfile = null;
        this._profileView = value;
        this.getUserInfo(this._profileView);
    }

    ngOnInit() {
        this.editForm = new FormGroup({
            email: new FormControl("", Validators.compose([Validators.required, Validators.email])),
            firstName: new FormControl(
                "",
                Validators.compose([
                    Validators.required,
                    this.formValidationService.noWhitespaceValidator,
                    this.formValidationService.noBadWordsValidator
                ])
            ),
            lastName: new FormControl(
                "",
                Validators.compose([
                    Validators.required,
                    this.formValidationService.noWhitespaceValidator,
                    this.formValidationService.noBadWordsValidator
                ])
            )
        });

        this.imageForm = new FormGroup({
            profileImageName: new FormControl(
                "",
                Validators.compose([Validators.required, this.formValidationService.correctFileType])
            ),
            profileImageSize: new FormControl(
                "",
                Validators.compose([Validators.required, this.formValidationService.correctFileSize])
            )
        });
    }

    /**
     * Gets the user profile of the user being viewed on the profile page
     *
     * @param username The username of the user to look up
     */
    getUserInfo(username: string): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.get(this.profilesAPI + username, httpHeaders).subscribe(
                    (data: Array<ProfileObject>) => {
                        let profile: ProfileObject = data[0];
                        this.userProfile = {
                            username: profile.username,
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            email: null,
                            profileImage: profile.profileImage + "?" + Math.random()
                        };

                        if (username === this.auth.getAuthenticatedUser().getUsername()) {
                            this.http.get(this.usersAPI + username, httpHeaders).subscribe(
                                (data: Array<UserObject>) => {
                                    let user: UserObject = data[0];
                                    if (user) {
                                        this.userProfile.email = user.email;
                                    }
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                        }
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

    toggleEditing(editing: boolean) {
        this.editing = editing;
        this.editForm.get(EMAIL_FORM_NAME).setValue(this.userProfile.email);
        this.editForm.get(FIRSTNAME_FORM_NAME).setValue(this.userProfile.firstName);
        this.editForm.get(LASTNAME_FORM_NAME).setValue(this.userProfile.lastName);
    }

    imageFormButtonClick(event) {
        let file = (event.target as HTMLInputElement).files[0];
        this.imageForm.controls["profileImageName"].setValue(file ? file.name : Constants.EMPTY);
        this.imageForm.controls["profileImageSize"].setValue(file ? file.size : Constants.EMPTY);
        ImageCompressor.compressImage(file, 200, 200, this.render)
            .then((result) => {
                this.newProfileImage = result;
                document.getElementById("hiddenButton").click();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    imageFormSubmit() {
        if (this.imageForm.valid) {
            this.updateProfilePicture();
        }
    }

    updateProfilePicture(): void {
        let username = this.auth.getAuthenticatedUser().getUsername();

        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                let imageFile: File = this.newProfileImage;

                let formData: FormData = new FormData();
                formData.append("file", imageFile);

                formData.append("username", username);

                this.http.put(this.profilesAPI + username + "/profile-image/", formData, httpHeaders).subscribe(
                    (data) => {
                        this.profileUpdateEvent.emit();
                        let img = document.getElementById("profileImage");
                        img["src"] = this.userProfile.profileImage + "?" + Math.random();
                        this.editSaveMessage = IMAGE_MESSAGE;
                    },
                    (err) => {
                        console.log(err);
                        this.editSaveMessage = ERROR_MESSAGE;
                    }
                );
            },
            (err) => {
                console.log(err);
            }
        );
    }

    editFormSubmit(form: FormGroup): void {
        this.submitAttempt = true;
        if (this.editForm.valid) {
            this.editUser(form.value.email, form.value.firstName, form.value.lastName);
        }
    }

    editUser(email: string, firstName: string, lastName: string) {
        let username = this.userProfile.username;

        let user: UserObject = {
            username: username,
            email: email
        };

        let profile: ProfileObject = {
            username: username,
            firstName: firstName,
            lastName: lastName,
            profileImage: this.userProfile.profileImage
        };

        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.put(this.usersAPI + username, user, httpHeaders).subscribe(
                    () => {
                        this.http.put(this.profilesAPI + username, profile, httpHeaders).subscribe(
                            () => {
                                this.getUserInfo(this.userProfile.username);
                                this.toggleEditing(false);
                                this.editSaveMessage = SUCCESS_MESSAGE;
                            },
                            (err) => {
                                this.editSaveMessage = ERROR_MESSAGE;
                                console.log(err);
                            }
                        );
                    },
                    (err) => {
                        this.editSaveMessage = ERROR_MESSAGE;
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
