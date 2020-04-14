import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from "@angular/core";
import { APIConfig, Constants, ProfileObject, UserProfileObject } from "../../shared/app-config";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "../../shared/common.service";
import { FormValidationService } from "../../shared/form-validation.service";
import { ImageCompressor } from "../../shared/ImageCompressor";

const LASTNAME_FORM_NAME = "lastName";
const FIRSTNAME_FORM_NAME = "firstName";
const BIO_FORM_NAME = "bio";
const GENDER_FORM_NAME = "gender";
const PHONE_FORM_NAME = "phone";
const DATEOFBIRTH_FORM_NAME = "dateOfBirth";
const CITIZENSHIP_FORM_NAME = "citizenship";
const GRADE_FORM_NAME = "grade";
const GRADYEAR_FORM_NAME = "gradYear";
const PREVIOUSCOLLEGIATE_FORM_NAME = "previousCollegiate";
const STREET_FORM_NAME = "street";
const UNITNUMBER_FORM_NAME = "unitNumber";
const CITY_FORM_NAME = "city";
const PROVINCE_FORM_NAME = "province";
const COUNTRY_FORM_NAME = "country";
const POSTALCODE_FORM_NAME = "postalCode";
const CLUB_FORM_NAME = "club";
const INJURYSTATUS_FORM_NAME = "injuryStatus";
const INSTAGRAM_FORM_NAME = "instagram";
const LANGUAGESENGLISH_FORM_NAME = "languagesEnglish";
const LANGUAGESSPANISH_FORM_NAME = "languagesSpanish";
const LANGUAGESFRENCH_FORM_NAME = "languagesFrench";
const LANGUAGESMANDARIN_FORM_NAME = "languagesMandarin";
const LANGUAGESOTHER_FORM_NAME = "languagesOther";
const COACHFIRSTNAME_FORM_NAME = "coachFirstName";
const COACHLASTNAME_FORM_NAME = "coachLastName";
const COACHPHONE_FORM_NAME = "coachPhone";
const COACHEMAIL_FORM_NAME = "coachEmail";
const PARENTFIRSTNAME_FORM_NAME = "parentFirstName";
const PARENTLASTNAME_FORM_NAME = "parentLastName";
const PARENTPHONE_FORM_NAME = "parentPhone";
const PARENTEMAIL_FORM_NAME = "parentEmail";
const BUDGET_FORM_NAME = "budget";
const ENGLISH = "English";
const SPANISH = "Spanish";
const FRENCH = "French";
const MANDARIN = "Mandarin";
const OTHER = "Other";

const STATUS_URI: string = "/status/";
const PROFILE_IMAGE_URI = "/profile-image/";
const STATUS_TEXT_IDENTIFIER: string = "statusText";

const HIDDEN_BUTTON_IDENTIFIER: string = "hiddenButton";
const PROFILE_IMAGE_NAME: string = "profileImageName";
const PROFILE_IMAGE_SIZE: string = "profileImageSize";
const PROFILE_IMAGE: string = "profileImage";

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
    statusForm: FormGroup;

    editing: boolean = false;
    editingStatus: boolean = false;
    submitAttempt: boolean = false;
    editSaveMessage: string = "";

    imageHover: boolean = false;
    @Output() profileUpdateEvent = new EventEmitter();
    private usersAPI = APIConfig.usersAPI;
    private profilesAPI = APIConfig.profilesAPI;
    private newProfileImage: File;

    constructor(
        public auth: AuthenticationService,
        private http: HttpClient,
        public common: CommonService,
        public formValidationService: FormValidationService,
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
            firstName: new FormControl(
                Constants.EMPTY,
                Validators.compose([
                    Validators.required,
                    this.formValidationService.noWhitespaceValidator,
                    this.formValidationService.noBadWordsValidator
                ])
            ),
            lastName: new FormControl(
                Constants.EMPTY,
                Validators.compose([
                    Validators.required,
                    this.formValidationService.noWhitespaceValidator,
                    this.formValidationService.noBadWordsValidator
                ])
            ),
            phone: new FormControl(
                Constants.EMPTY,
                Validators.compose([this.formValidationService.isNanValidator, Validators.maxLength(15)])
            ),
            bio: new FormControl(
                Constants.EMPTY,
                Validators.compose([this.formValidationService.noBadWordsValidator, Validators.maxLength(150)])
            ),
            coachFirstName: new FormControl(
                Constants.EMPTY,
                Validators.compose([this.formValidationService.noBadWordsValidator])
            ),
            coachLastName: new FormControl(
                Constants.EMPTY,
                Validators.compose([this.formValidationService.noBadWordsValidator])
            ),
            coachPhone: new FormControl(
                Constants.EMPTY,
                Validators.compose([this.formValidationService.isNanValidator, Validators.maxLength(15)])
            ),
            parentFirstName: new FormControl(
                Constants.EMPTY,
                Validators.compose([this.formValidationService.noBadWordsValidator])
            ),
            parentLastName: new FormControl(
                Constants.EMPTY,
                Validators.compose([this.formValidationService.noBadWordsValidator])
            ),
            parentPhone: new FormControl(
                Constants.EMPTY,
                Validators.compose([this.formValidationService.isNanValidator, Validators.maxLength(15)])
            ),
            coachEmail: new FormControl(),
            parentEmail: new FormControl(),
            languagesEnglish: new FormControl(),
            languagesFrench: new FormControl(),
            languagesSpanish: new FormControl(),
            languagesMandarin: new FormControl(),
            languagesOther: new FormControl(),
            gender: new FormControl(),
            dateOfBirth: new FormControl(),
            citizenship: new FormControl(),
            grade: new FormControl(),
            gradYear: new FormControl(),
            previousCollegiate: new FormControl(),
            street: new FormControl(),
            unitNumber: new FormControl(),
            city: new FormControl(),
            province: new FormControl(),
            country: new FormControl(),
            postalCode: new FormControl(),
            club: new FormControl(),
            injuryStatus: new FormControl(),
            instagram: new FormControl(),
            budget: new FormControl()
        });

        this.imageForm = new FormGroup({
            profileImageName: new FormControl(
                Constants.EMPTY,
                Validators.compose([Validators.required, this.formValidationService.correctFileType])
            ),
            profileImageSize: new FormControl(
                Constants.EMPTY,
                Validators.compose([Validators.required, this.formValidationService.correctFileSize])
            )
        });
        this.statusForm = new FormGroup({
            statusText: new FormControl(Constants.EMPTY, Validators.compose([Validators.required]))
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
                            profileImage: profile.profileImage + Constants.QUESTION_MARK + Math.random(),
                            statusText: profile.statusText,
                            phone: profile.phone,
                            bio: profile.bio,
                            gender: profile.gender,
                            dateOfBirth: profile.dateOfBirth,
                            citizenship: profile.citizenship,
                            grade: profile.grade,
                            gradYear: profile.gradYear,
                            previousCollegiate: profile.previousCollegiate,
                            street: profile.street,
                            unitNumber: profile.unitNumber,
                            city: profile.city,
                            province: profile.province,
                            country: profile.country,
                            postalCode: profile.postalCode,
                            club: profile.club,
                            injuryStatus: profile.injuryStatus,
                            instagram: profile.instagram,
                            languages: profile.languages,
                            coachFirstName: profile.coachFirstName,
                            coachLastName: profile.coachLastName,
                            coachPhone: profile.coachPhone,
                            coachEmail: profile.coachEmail,
                            parentFirstName: profile.parentFirstName,
                            parentLastName: profile.parentLastName,
                            parentPhone: profile.parentPhone,
                            parentEmail: profile.parentEmail,
                            budget: profile.budget
                        };
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
        this.editForm.get(FIRSTNAME_FORM_NAME).setValue(this.userProfile.firstName);
        this.editForm.get(LASTNAME_FORM_NAME).setValue(this.userProfile.lastName);
        this.editForm.get(BIO_FORM_NAME).setValue(this.userProfile.bio);
        this.editForm.get(PHONE_FORM_NAME).setValue(this.userProfile.phone);
        this.editForm.get(GENDER_FORM_NAME).setValue(this.userProfile.gender);
        this.editForm.get(DATEOFBIRTH_FORM_NAME).setValue(this.userProfile.dateOfBirth);
        this.editForm.get(CITIZENSHIP_FORM_NAME).setValue(this.userProfile.citizenship);
        this.editForm.get(GRADE_FORM_NAME).setValue(this.userProfile.grade);
        this.editForm.get(GRADYEAR_FORM_NAME).setValue(this.userProfile.gradYear);
        this.editForm.get(PREVIOUSCOLLEGIATE_FORM_NAME).setValue(this.userProfile.previousCollegiate);
        this.editForm.get(STREET_FORM_NAME).setValue(this.userProfile.street);
        this.editForm.get(UNITNUMBER_FORM_NAME).setValue(this.userProfile.unitNumber);
        this.editForm.get(CITY_FORM_NAME).setValue(this.userProfile.city);
        this.editForm.get(PROVINCE_FORM_NAME).setValue(this.userProfile.province);
        this.editForm.get(COUNTRY_FORM_NAME).setValue(this.userProfile.country);
        this.editForm.get(POSTALCODE_FORM_NAME).setValue(this.userProfile.postalCode);
        this.editForm.get(CLUB_FORM_NAME).setValue(this.userProfile.club);
        this.editForm.get(INJURYSTATUS_FORM_NAME).setValue(this.userProfile.injuryStatus);
        this.editForm.get(INSTAGRAM_FORM_NAME).setValue(this.userProfile.instagram);
        this.editForm.get(COACHFIRSTNAME_FORM_NAME).setValue(this.userProfile.coachFirstName);
        this.editForm.get(COACHLASTNAME_FORM_NAME).setValue(this.userProfile.coachLastName);
        this.editForm.get(COACHPHONE_FORM_NAME).setValue(this.userProfile.coachPhone);
        this.editForm.get(COACHEMAIL_FORM_NAME).setValue(this.userProfile.coachEmail);
        this.editForm.get(PARENTFIRSTNAME_FORM_NAME).setValue(this.userProfile.parentFirstName);
        this.editForm.get(PARENTLASTNAME_FORM_NAME).setValue(this.userProfile.parentLastName);
        this.editForm.get(PARENTPHONE_FORM_NAME).setValue(this.userProfile.parentPhone);
        this.editForm.get(PARENTEMAIL_FORM_NAME).setValue(this.userProfile.parentEmail);
        this.editForm.get(BUDGET_FORM_NAME).setValue(this.userProfile.budget);
        if (this.userProfile.languages) {
            if (this.userProfile.languages == [" "] || this.userProfile.languages.length == 0) {
                this.editForm.get(LANGUAGESENGLISH_FORM_NAME).setValue(false);
                this.editForm.get(LANGUAGESFRENCH_FORM_NAME).setValue(false);
                this.editForm.get(LANGUAGESSPANISH_FORM_NAME).setValue(false);
                this.editForm.get(LANGUAGESMANDARIN_FORM_NAME).setValue(false);
                this.editForm.get(LANGUAGESOTHER_FORM_NAME).setValue(false);
            } else {
                if (this.userProfile.languages.includes(ENGLISH))
                    this.editForm.get(LANGUAGESENGLISH_FORM_NAME).setValue(true);
                if (this.userProfile.languages.includes(SPANISH))
                    this.editForm.get(LANGUAGESSPANISH_FORM_NAME).setValue(true);
                if (this.userProfile.languages.includes(FRENCH))
                    this.editForm.get(LANGUAGESFRENCH_FORM_NAME).setValue(true);
                if (this.userProfile.languages.includes(MANDARIN))
                    this.editForm.get(LANGUAGESMANDARIN_FORM_NAME).setValue(true);
                if (this.userProfile.languages.includes(OTHER))
                    this.editForm.get(LANGUAGESOTHER_FORM_NAME).setValue(true);
            }
        } else {
            this.editForm.get(LANGUAGESENGLISH_FORM_NAME).setValue(false);
            this.editForm.get(LANGUAGESFRENCH_FORM_NAME).setValue(false);
            this.editForm.get(LANGUAGESSPANISH_FORM_NAME).setValue(false);
            this.editForm.get(LANGUAGESMANDARIN_FORM_NAME).setValue(false);
            this.editForm.get(LANGUAGESOTHER_FORM_NAME).setValue(false);
        }
    }

    toggleEditingStatus(editingStatus: boolean) {
        this.editingStatus = editingStatus;
        this.statusForm.get(STATUS_TEXT_IDENTIFIER).setValue(this.userProfile.statusText);
    }

    statusFormSubmit(form: FormGroup) {
        let username = this.auth.getAuthenticatedUser().getUsername();
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http
                    .put(
                        this.profilesAPI + username + STATUS_URI,
                        {
                            username: username,
                            status: this.common.santizeText(form.value.statusText)
                        },
                        httpHeaders
                    )
                    .subscribe(
                        () => {
                            this.userProfile.statusText = this.common.santizeText(form.value.statusText);
                            this.toggleEditingStatus(false);
                            this.profileUpdateEvent.emit();
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

    imageFormButtonClick(event) {
        let file = (event.target as HTMLInputElement).files[0];
        this.imageForm.controls[PROFILE_IMAGE_NAME].setValue(file ? file.name : Constants.EMPTY);
        this.imageForm.controls[PROFILE_IMAGE_SIZE].setValue(file ? file.size : Constants.EMPTY);
        ImageCompressor.compressImage(file, 200, 200, this.render)
            .then((result) => {
                this.newProfileImage = result;
                document.getElementById(HIDDEN_BUTTON_IDENTIFIER).click();
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
                formData.append(Constants.FILE, imageFile);

                formData.append(Constants.USERNAME, username);

                this.http.put(this.profilesAPI + username + PROFILE_IMAGE_URI, formData, httpHeaders).subscribe(
                    () => {
                        this.profileUpdateEvent.emit();
                        let img = document.getElementById(PROFILE_IMAGE);
                        img[Constants.SRC] = this.userProfile.profileImage + Constants.QUESTION_MARK + Math.random();
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
            let languages = [];
            if (form.value.languagesEnglish) languages.push("English");
            if (form.value.languagesFrench) languages.push("French");
            if (form.value.languagesSpanish) languages.push("Spanish");
            if (form.value.languagesMandarin) languages.push("Mandarin");
            if (form.value.languagesOther) languages.push("Other");
            this.editUser(
                form.value.firstName,
                form.value.lastName,
                form.value.phone,
                form.value.bio,
                form.value.gender,
                form.value.dateOfBirth,
                form.value.citizenship,
                form.value.grade,
                form.value.gradYear,
                form.value.previousCollegiate,
                form.value.street,
                form.value.unitNumber,
                form.value.city,
                form.value.province,
                form.value.country,
                form.value.postalCode,
                form.value.club,
                form.value.injuryStatus,
                form.value.instagram,
                languages,
                form.value.coachFirstName,
                form.value.coachLastName,
                form.value.coachPhone,
                form.value.coachEmail,
                form.value.parentFirstName,
                form.value.parentLastName,
                form.value.parentPhone,
                form.value.parentEmail,
                form.value.budget
            );
        }
    }

    editUser(
        firstName: string,
        lastName: string,
        phone: string,
        bio: string,
        gender: string,
        dateOfBirth: string,
        citizenship: string,
        grade: number,
        gradYear: number,
        previousCollegiate: boolean,
        street: string,
        unitNumber: string,
        city: string,
        province: string,
        country: string,
        postalCode: string,
        club: string,
        injuryStatus: string,
        instagram: string,
        languages: Array<string>,
        coachFirstName: string,
        coachLastName: string,
        coachPhone: string,
        coachEmail: string,
        parentFirstName: string,
        parentLastName: string,
        parentPhone: string,
        parentEmail: string,
        budget: string
    ) {
        let username = this.userProfile.username;

        firstName = this.common.santizeText(firstName);
        lastName = this.common.santizeText(lastName);
        phone = this.common.santizeText(phone);
        bio = this.common.santizeText(bio);
        gender = this.common.santizeText(gender);
        dateOfBirth = this.common.santizeText(dateOfBirth);
        citizenship = this.common.santizeText(citizenship);
        street = this.common.santizeText(street);
        unitNumber = this.common.santizeText(unitNumber);
        city = this.common.santizeText(city);
        province = this.common.santizeText(province);
        country = this.common.santizeText(country);
        postalCode = this.common.santizeText(postalCode);
        club = this.common.santizeText(club);
        injuryStatus = this.common.santizeText(injuryStatus);
        instagram = this.common.santizeText(instagram);
        coachFirstName = this.common.santizeText(coachFirstName);
        coachLastName = this.common.santizeText(coachLastName);
        coachPhone = this.common.santizeText(coachPhone);
        coachEmail = this.common.santizeText(coachEmail);
        parentFirstName = this.common.santizeText(parentFirstName);
        parentLastName = this.common.santizeText(parentLastName);
        parentPhone = this.common.santizeText(parentPhone);
        parentEmail = this.common.santizeText(parentEmail);
        budget = this.common.santizeText(budget);

        let profile: ProfileObject = {
            username: username,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            bio: bio,
            gender: gender,
            dateOfBirth: dateOfBirth,
            citizenship: citizenship,
            grade: grade,
            gradYear: gradYear,
            previousCollegiate: previousCollegiate,
            street: street,
            unitNumber: unitNumber,
            city: city,
            province: province,
            country: country,
            postalCode: postalCode,
            club: club,
            injuryStatus: injuryStatus,
            instagram: instagram,
            languages: languages,
            coachFirstName: coachFirstName,
            coachLastName: coachLastName,
            coachPhone: coachPhone,
            coachEmail: coachEmail,
            parentFirstName: parentFirstName,
            parentLastName: parentLastName,
            parentPhone: parentPhone,
            parentEmail: parentEmail,
            budget: budget,
            profileImage: this.userProfile.profileImage,
            statusText: this.userProfile.statusText
        };

        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.put(this.usersAPI + username, profile.username, httpHeaders).subscribe(
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
