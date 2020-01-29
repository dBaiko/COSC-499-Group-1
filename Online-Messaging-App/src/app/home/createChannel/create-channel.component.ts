import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {APIConfig, Constants} from "../../shared/app-config";
import {FormValidationService} from "../../shared/form-validation.service";
import {CommonService} from "../../shared/common.service";
import {AuthenticationService} from "../../shared/authentication.service";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

interface ChannelAndFirstUser {
    channelName: string,
    channelType: string,
    firstUsername: string,
    firstUserChannelRole: string
}

interface ChannelObject {
    channelId: string,
    channelName: string,
    channelType: string
}

interface newChannelResponse {
    status: number,
    data: {
        message: string,
        newChannel: ChannelObject
    }
}

const defaultFirstChannelRole = "admin";

@Component({
    selector: 'app-create-channel',
    templateUrl: './create-channel.component.html',
    styleUrls: ['./create-channel.component.scss']
})
export class CreateChannelComponent implements OnInit {
    newChannelForm: FormGroup;
    submitAttempt: boolean = false;
    private channelAPI: string = APIConfig.channelsAPI;
    @Output() newChannelEvent: EventEmitter<any> = new EventEmitter<any>();
    data: ChannelObject = null;
    constructor(private auth: AuthenticationService, private http: HttpClient, public common: CommonService, private formValidationService: FormValidationService, public dialogRef: MatDialogRef<CreateChannelComponent>) {
    }

    ngOnInit() {
        this.newChannelForm = new FormGroup({
            channelName: new FormControl("", Validators.compose([
                Validators.required,
                this.formValidationService.isAlphanumericValidator
            ])),
            channelType: new FormControl("", Validators.compose([
                Validators.required
            ]))
        });
    }

    newChannelEntry(channelName: string, channelType: string): Promise<Object> {
        let newChannel: ChannelAndFirstUser = {
            channelName: channelName,
            channelType: channelType,
            firstUsername: this.auth.getAuthenticatedUser().getUsername(),
            firstUserChannelRole: defaultFirstChannelRole
        };

        return this.http.post(this.channelAPI, newChannel, Constants.HTTP_OPTIONS).toPromise();// TODO: check for errors in responce

    }


    newChannel(form: FormGroup): void {
        this.submitAttempt = true;
        if (this.newChannelForm.valid) {
            this.newChannelEntry(form.value.channelName, form.value.channelType)
                .then((result: newChannelResponse) => {
                    this.data = result.data.newChannel;
                    this.onClose();
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }
    onClose(): void{
        this.dialogRef.close(this.data);

    }



}
