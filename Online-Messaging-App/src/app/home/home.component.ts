import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../shared/authentication.service";
import { CommonService } from "../shared/common.service";
import { FormBuilder, FormGroup } from "@angular/forms";

const PROFILE_PAGE = "profile";

interface userChannelObject {
    username: string;
    channelId: number;
    userChannelRole: string;
    channelName: string;
    channelType: string;
}

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
    userLoggedIn = false;
    options: FormGroup;

    display: string = "channelBrowser";
    selectedChannelId: number;
    selectedChannelName: string;
    newAddedChannel: ChannelObject;
    newSubbedChannel: userChannelObject;
    profileView: string;
    private scrollContainer: any;

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

    addNewChannel($event) {
        this.newAddedChannel = $event;
    }

    updateDisplay(value: string): void {
        this.display = value;
    }

    updateProfile(value: string): void {
        this.profileView = value;
        this.updateDisplay(PROFILE_PAGE);
    }
}
