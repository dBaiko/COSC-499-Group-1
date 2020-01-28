import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "../shared/authentication.service";
import {CommonService} from "../shared/common.service";
import {FormBuilder, FormGroup} from "@angular/forms";

interface userChannelObject {
    username: string;
    channelId: number;
    userChannelRole: string;
    channelName: string;
    channelType: string;
}

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {

    userLoggedIn = false;
    options: FormGroup;

    messagesShown = false;

    selectedChannelId: number;
    selectedChannelName: string;

    newSubbedChannel: userChannelObject;

    constructor(private auth: AuthenticationService, public common: CommonService, fb: FormBuilder) {
        this.userLoggedIn = auth.isLoggedIn();
        this.options = fb.group({
            bottom: 0,
            fixed: false,
            top: 0
        });
    }

    ngOnInit(): void {
    }

    receiveId($event) {
        this.selectedChannelId = $event;

    }

    receiveName($event) {
        this.selectedChannelName = $event;
    }

    receiveNewSubbedChannel($event) {
        this.newSubbedChannel = $event;
    }

}
