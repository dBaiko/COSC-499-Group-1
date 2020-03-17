import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { APIConfig } from "../../shared/app-config";
import { FormValidationService } from "../../shared/form-validation.service";
import { CommonService } from "../../shared/common.service";
import { AuthenticationService } from "../../shared/authentication.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";

interface ChannelAndFirstUser {
    channelName: string;
    channelType: string;
    firstUsername: string;
    firstUserChannelRole: string;
}

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

interface newChannelResponse {
    status: number;
    data: {
        message: string;
        newChannel: ChannelObject;
    };
}

const defaultFirstChannelRole = "admin";

@Component({
    selector: "app-create-channel",
    templateUrl: "./create-channel.component.html",
    styleUrls: ["./create-channel.component.scss"]
})
export class CreateChannelComponent implements OnInit {
    newChannelForm: FormGroup;
    submitAttempt: boolean = false;
    @Output() newChannelEvent: EventEmitter<any> = new EventEmitter<any>();
    data: ChannelObject = null;
    private channelAPI: string = APIConfig.channelsAPI;

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient,
        public common: CommonService,
        private formValidationService: FormValidationService,
        public dialogRef: MatDialogRef<CreateChannelComponent>
    ) {
    }

    ngOnInit() {
        this.newChannelForm = new FormGroup({
            channelName: new FormControl(
                "",
                Validators.compose([Validators.required, Validators.maxLength(30), this.formValidationService.noBadWordsValidator])
            ),
            channelType: new FormControl("", Validators.compose([Validators.required]))
        });
    }

    newChannelEntry(channelName: string, channelType: string): Observable<Object> {
        let newChannel: ChannelAndFirstUser = {
            channelName: channelName,
            channelType: channelType,
            firstUsername: this.auth.getAuthenticatedUser().getUsername(),
            firstUserChannelRole: defaultFirstChannelRole
        };

        return new Observable<Object>((observer) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
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
                    ); // TODO: check for errors in responce
                },
                (err) => {
                    console.log(err);
                }
            );
        });
    }

    newChannel(form: FormGroup): void {
        this.submitAttempt = true;
        if (this.newChannelForm.valid) {
            this.newChannelEntry(form.value.channelName, form.value.channelType).subscribe(
                (result: newChannelResponse) => {
                    this.data = result.data.newChannel;
                    this.onClose();
                    this.newChannelEvent.emit(result.data.newChannel);
                },
                (err) => {
                    console.log(err);
                }
            );
        }
    }

    onClose(): void {
        this.dialogRef.close(this.data);
    }
}
