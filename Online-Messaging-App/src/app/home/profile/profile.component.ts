import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from "@angular/core";
import {
    APIConfig,
    Constants,
    ProfileImageUpdateObject,
    ProfileObject,
    UserProfileObject
} from "../../shared/app-config";
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

const NA = "N/A";
const TWO_THOUSAND = "2000";
const DEFAULT_DATE = "1111-01-01";

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

    public get profileView(): string {
        return this._profileView;
    }

    @Input()
    public set profileView(value: string) {
        this.userProfile = null;
        this._profileView = value;
        this.getUserInfo(this._profileView);
    }

    public ngOnInit() {
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

    public getUserInfo(username: string): void {
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
                        console.error(err);
                    }
                );
            },
            (err) => {
                console.error(err);
            }
        );
    }

    public toggleEditing(editing: boolean): void {
        this.editing = editing;
        this.editForm.get(FIRSTNAME_FORM_NAME).setValue(this.userProfile.firstName ? this.userProfile.firstName : NA);
        this.editForm.get(LASTNAME_FORM_NAME).setValue(this.userProfile.lastName ? this.userProfile.lastName : NA);
        this.editForm.get(BIO_FORM_NAME).setValue(this.userProfile.bio ? this.userProfile.bio : NA);
        this.editForm.get(PHONE_FORM_NAME).setValue(this.userProfile.phone ? this.userProfile.phone : Constants.EMPTY);
        this.editForm.get(GENDER_FORM_NAME).setValue(this.userProfile.gender ? this.userProfile.gender : NA);
        this.editForm
            .get(DATEOFBIRTH_FORM_NAME)
            .setValue(
                this.userProfile.dateOfBirth != DEFAULT_DATE && this.userProfile.dateOfBirth != Constants.SPACE
                    ? this.userProfile.dateOfBirth
                    : Constants.EMPTY
            );
        this.editForm
            .get(CITIZENSHIP_FORM_NAME)
            .setValue(this.userProfile.citizenship ? this.userProfile.citizenship : NA);
        this.editForm.get(GRADE_FORM_NAME).setValue(this.userProfile.grade ? this.userProfile.grade : NA);
        this.editForm
            .get(GRADYEAR_FORM_NAME)
            .setValue(
                this.userProfile.gradYear != NA && this.userProfile.gradYear != TWO_THOUSAND
                    ? this.userProfile.gradYear
                    : Constants.EMPTY
            );
        this.editForm
            .get(PREVIOUSCOLLEGIATE_FORM_NAME)
            .setValue(this.userProfile.previousCollegiate ? this.userProfile.previousCollegiate : NA);
        this.editForm.get(STREET_FORM_NAME).setValue(this.userProfile.street ? this.userProfile.street : NA);
        this.editForm
            .get(UNITNUMBER_FORM_NAME)
            .setValue(this.userProfile.unitNumber ? this.userProfile.unitNumber : NA);
        this.editForm.get(CITY_FORM_NAME).setValue(this.userProfile.city ? this.userProfile.city : NA);
        this.editForm.get(PROVINCE_FORM_NAME).setValue(this.userProfile.province ? this.userProfile.province : NA);
        this.editForm.get(COUNTRY_FORM_NAME).setValue(this.userProfile.country ? this.userProfile.country : NA);
        this.editForm
            .get(POSTALCODE_FORM_NAME)
            .setValue(this.userProfile.postalCode ? this.userProfile.postalCode : NA);
        this.editForm.get(CLUB_FORM_NAME).setValue(this.userProfile.club ? this.userProfile.club : NA);
        this.editForm
            .get(INJURYSTATUS_FORM_NAME)
            .setValue(this.userProfile.injuryStatus ? this.userProfile.injuryStatus : NA);
        this.editForm.get(INSTAGRAM_FORM_NAME).setValue(this.userProfile.instagram ? this.userProfile.instagram : NA);
        this.editForm
            .get(COACHFIRSTNAME_FORM_NAME)
            .setValue(this.userProfile.coachFirstName ? this.userProfile.coachFirstName : NA);
        this.editForm
            .get(COACHLASTNAME_FORM_NAME)
            .setValue(this.userProfile.coachLastName ? this.userProfile.coachLastName : NA);
        this.editForm
            .get(COACHPHONE_FORM_NAME)
            .setValue(this.userProfile.coachPhone ? this.userProfile.coachPhone : Constants.EMPTY);
        this.editForm
            .get(COACHEMAIL_FORM_NAME)
            .setValue(this.userProfile.coachEmail ? this.userProfile.coachEmail : NA);
        this.editForm
            .get(PARENTFIRSTNAME_FORM_NAME)
            .setValue(this.userProfile.parentFirstName ? this.userProfile.parentFirstName : NA);
        this.editForm
            .get(PARENTLASTNAME_FORM_NAME)
            .setValue(this.userProfile.parentLastName ? this.userProfile.parentLastName : NA);
        this.editForm
            .get(PARENTPHONE_FORM_NAME)
            .setValue(this.userProfile.parentPhone ? this.userProfile.parentPhone : Constants.EMPTY);
        this.editForm
            .get(PARENTEMAIL_FORM_NAME)
            .setValue(this.userProfile.parentEmail ? this.userProfile.parentEmail : NA);
        this.editForm.get(BUDGET_FORM_NAME).setValue(this.userProfile.budget ? this.userProfile.budget : NA);
        if (this.userProfile.languages) {
            if (this.userProfile.languages == [Constants.EMPTY] || this.userProfile.languages.length == 0) {
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

    public toggleEditingStatus(editingStatus: boolean): void {
        this.editingStatus = editingStatus;
        this.statusForm
            .get(STATUS_TEXT_IDENTIFIER)
            .setValue(this.userProfile.statusText ? this.userProfile.statusText : "");
    }

    public statusFormSubmit(form: FormGroup): void {
        let username = this.auth.getAuthenticatedUser().getUsername();
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                let statusText = this.common.sanitizeText(form.value.statusText);
                if (statusText == null || statusText == Constants.EMPTY) {
                    statusText = Constants.SPACE;
                }

                this.http
                    .put(
                        this.profilesAPI + username + STATUS_URI,
                        {
                            username: username,
                            status: this.common.sanitizeText(form.value.statusText)
                        },
                        httpHeaders
                    )
                    .subscribe(
                        () => {
                            this.userProfile.statusText = statusText;
                            this.toggleEditingStatus(false);
                            this.profileUpdateEvent.emit();
                        },
                        (err) => {
                            console.error(err);
                            this.editSaveMessage = ERROR_MESSAGE;
                        }
                    );
            },
            (err) => {
                console.error(err);
            }
        );
    }

    public imageFormButtonClick(event): void {
        let file = (event.target as HTMLInputElement).files[0];
        this.imageForm.controls[PROFILE_IMAGE_NAME].setValue(file ? file.name : Constants.EMPTY);
        this.imageForm.controls[PROFILE_IMAGE_SIZE].setValue(file ? file.size : Constants.EMPTY);
        ImageCompressor.compressImage(file, 200, 200, this.render)
            .then((result) => {
                this.newProfileImage = result;
                document.getElementById(HIDDEN_BUTTON_IDENTIFIER).click();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    public imageFormSubmit(): void {
        if (this.imageForm.valid) {
            this.updateProfilePicture();
        }
    }

    public updateProfilePicture(): void {
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
                    (data: ProfileImageUpdateObject) => {
                        this.profileUpdateEvent.emit();
                        let img = document.getElementById(PROFILE_IMAGE);
                        this.userProfile.profileImage = data.profileImage + Constants.QUESTION_MARK + Math.random();
                        img[Constants.SRC] = this.userProfile.profileImage;
                        this.editSaveMessage = IMAGE_MESSAGE;
                    },
                    (err) => {
                        console.error(err);
                        this.editSaveMessage = ERROR_MESSAGE;
                    }
                );
            },
            (err) => {
                console.error(err);
            }
        );
    }

    public editFormSubmit(form: FormGroup): void {
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

    public editUser(
        firstName: string,
        lastName: string,
        phone: string,
        bio: string,
        gender: string,
        dateOfBirth: string,
        citizenship: string,
        grade: number,
        gradYear: string,
        previousCollegiate: string,
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
    ): void {
        let username = this.userProfile.username;

        firstName = this.common.sanitizeText(firstName);
        lastName = this.common.sanitizeText(lastName);
        phone = this.common.sanitizeText(phone);
        bio = this.common.sanitizeText(bio);
        gender = this.common.sanitizeText(gender);
        dateOfBirth = this.common.sanitizeText(dateOfBirth);
        citizenship = this.common.sanitizeText(citizenship);
        street = this.common.sanitizeText(street);
        unitNumber = this.common.sanitizeText(unitNumber);
        city = this.common.sanitizeText(city);
        province = this.common.sanitizeText(province);
        country = this.common.sanitizeText(country);
        postalCode = this.common.sanitizeText(postalCode);
        club = this.common.sanitizeText(club);
        injuryStatus = this.common.sanitizeText(injuryStatus);
        instagram = this.common.sanitizeText(instagram);
        coachFirstName = this.common.sanitizeText(coachFirstName);
        coachLastName = this.common.sanitizeText(coachLastName);
        coachPhone = this.common.sanitizeText(coachPhone);
        coachEmail = this.common.sanitizeText(coachEmail);
        parentFirstName = this.common.sanitizeText(parentFirstName);
        parentLastName = this.common.sanitizeText(parentLastName);
        parentPhone = this.common.sanitizeText(parentPhone);
        parentEmail = this.common.sanitizeText(parentEmail);
        budget = this.common.sanitizeText(budget);

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

                this.http.put(this.usersAPI + username, profile, httpHeaders).subscribe(
                    () => {
                        this.http.put(this.profilesAPI + username, profile, httpHeaders).subscribe(
                            () => {
                                this.getUserInfo(this.userProfile.username);
                                this.toggleEditing(false);
                                this.editSaveMessage = SUCCESS_MESSAGE;
                            },
                            (err) => {
                                this.editSaveMessage = ERROR_MESSAGE;
                                console.error(err);
                            }
                        );
                    },
                    (err) => {
                        this.editSaveMessage = ERROR_MESSAGE;
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
