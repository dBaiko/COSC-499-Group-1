import { Component, EventEmitter, Inject, OnInit, Optional, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
    APIConfig,
    ChannelAndFirstUser,
    ChannelObject,
    Constants,
    newChannelResponse,
    ProfileObject
} from "../../../shared/app-config";
import { FormValidationService } from "../../../shared/form-validation.service";
import { CommonService } from "../../../shared/common.service";
import { AuthenticationService } from "../../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { CognitoIdToken } from "amazon-cognito-identity-js";

const defaultFirstChannelRole = "admin";

@Component({
    selector: "app-create-channel",
    templateUrl: "./create-channel.component.html",
    styleUrls: ["./create-channel.component.scss"]
})
export class CreateChannelComponent implements OnInit {
    public newChannelForm: FormGroup;
    public submitAttempt: boolean = false;
    public newChannelObject: ChannelObject = null;

    currentUserProfile: ProfileObject;
    @Output() newChannelEvent: EventEmitter<any> = new EventEmitter<any>();

    private channelAPI: string = APIConfig.channelsAPI;

    constructor(
        public auth: AuthenticationService,
        private http: HttpClient,
        public common: CommonService,
        public formValidationService: FormValidationService,
        public dialogRef: MatDialogRef<CreateChannelComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.currentUserProfile = data;
    }

    public ngOnInit() {
        this.newChannelForm = new FormGroup({
            channelName: new FormControl(
                Constants.EMPTY,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(30),
                    this.formValidationService.noBadWordsValidator
                ])
            ),
            channelType: new FormControl(Constants.EMPTY, Validators.compose([Validators.required])),
            channelDescription: new FormControl(Constants.EMPTY, Validators.compose([Validators.required]))
        });
    }

    public newChannelEntry(channelName: string, channelType: string, channelDescription: string): Observable<Object> {
        channelName = this.common.sanitizeText(channelName);
        channelDescription = this.common.sanitizeText(channelDescription);
        let newChannel: ChannelAndFirstUser = {
            channelName: channelName,
            channelType: channelType,
            channelDescription: channelDescription,
            firstUsername: this.auth.getAuthenticatedUser().getUsername(),
            firstUserChannelRole: defaultFirstChannelRole,
            profileImage: this.currentUserProfile.profileImage,
            inviteStatus: null
        };

        return new Observable<Object>((observer) => {
            this.auth.getCurrentSessionId().subscribe(
                (data: CognitoIdToken) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http.post(this.channelAPI, newChannel, httpHeaders).subscribe(
                        (data) => {
                            observer.next(data);
                            observer.complete();
                        },
                        (err) => {
                            observer.error(err);
                        }
                    );
                },
                (err) => {
                    console.error(err);
                }
            );
        });
    }

    public newChannel(form: FormGroup): void {
        this.submitAttempt = true;
        if (this.newChannelForm.valid) {
            this.newChannelEntry(
                form.value.channelName,
                form.value.channelType,
                form.value.channelDescription
            ).subscribe(
                (result: newChannelResponse) => {
                    this.newChannelObject = result.data.newChannel;
                    this.onClose();
                    this.newChannelEvent.emit(result.data.newChannel);
                },
                (err) => {
                    console.error(err);
                }
            );
        }
    }

    public onClose(): void {
        this.dialogRef.close(this.newChannelObject);
    }

    public clickOutsideClose(): void {
        this.dialogRef.close(null);
    }
}
